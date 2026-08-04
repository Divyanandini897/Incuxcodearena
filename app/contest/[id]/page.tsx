'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PROBLEMS_DATA } from '@/src/data/data'
import { Problem, EvaluationResult } from '@/src/types'
import { supabase } from '@/src/utils/supabaseClient'
import { Loader2, Play, Check, Terminal, ChevronDown, ChevronUp, AlertTriangle, Clock, Trophy, AlertCircle, ArrowLeft, ArrowRight, RotateCcw, ShieldAlert } from 'lucide-react'
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection, highlightSpecialChars } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { indentOnInput, bracketMatching, foldGutter, foldKeymap, syntaxTree } from '@codemirror/language'
import { linter, lintGutter } from '@codemirror/lint'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { go } from '@codemirror/lang-go'
import { oneDark } from '@codemirror/theme-one-dark'

type ContestPhase = 'before' | 'during' | 'after'
type ViolationType = 'fullscreen_exit' | 'tab_switch' | 'paste_attempt'

interface ContestProblem {
  id: string
  sortOrder: number
  points: number
  problem: { leetcodeId: number; title: string; difficulty: string }
}

interface ContestData {
  id: string
  title: string
  description: string | null
  durationMins: number
  maxPoints: number
  maxViolations: number
  startsAt: string | null
  endsAt: string | null
  problems: ContestProblem[]
}

interface LeaderboardEntry {
  rank: number
  name: string
  score: number
  solved: number
  timeTaken: number | null
}

const getLangExt = (lang: string) => {
  switch (lang) {
    case 'JavaScript': return javascript()
    case 'Python': return python()
    case 'Java': return java()
    case 'C++': return cpp()
    case 'Go': return go()
    default: return javascript()
  }
}

// Safely parse codenode_contest_mode — handles both old format (plain UUID string)
// and current format (JSON object with { contestId, startedAt })
const parseContestModeSession = (stored: string): { contestId?: string } => {
  try {
    const parsed = JSON.parse(stored)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
  } catch { /* old format: plain contestId string */ }
  return { contestId: stored }
}

const syntaxErrorLinter = linter((view) => {
  const tree = syntaxTree(view.state)
  const diagnostics: { from: number; to: number; message: string; severity: 'error' }[] = []
  tree.iterate({
    enter: (node) => {
      if (node.type.isError) {
        const from = node.from
        const to = node.to
        const text = view.state.sliceDoc(from, to).slice(0, 30)
        diagnostics.push({
          from,
          to: to > from ? to : from + 1,
          message: text ? `Syntax error: unexpected "${text}"` : 'Syntax error',
          severity: 'error',
        })
      }
    },
  })
  return diagnostics
})

export default function ContestPage() {
  const params = useParams()
  const router = useRouter()
  const contestId = params.id as string

  // --- Auth ---
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // --- Contest data ---
  const [contest, setContest] = useState<ContestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --- Problem data ---
  const [problems, setProblems] = useState<Problem[]>([])
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0)

  // --- Timer ---
  const [contestPhase, setContestPhase] = useState<ContestPhase>('before')
  const [countdownSecs, setCountdownSecs] = useState(0)
  const phaseRef = useRef<ContestPhase>('before')

  // --- Pre-check ---
  const [showPreCheck, setShowPreCheck] = useState(false)
  const [preCheckVerifying, setPreCheckVerifying] = useState(false)
  const [preCheckError, setPreCheckError] = useState<string | null>(null)

  // --- Contest state ---
  const contestStartedRef = useRef(false)
  const [contestCompleted, setContestCompleted] = useState(false)
  const [completionResult, setCompletionResult] = useState<{
    score: number; totalProblems: number; solved: number; failed: number; timeTakenMs: number
  } | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const isSubmittingRef = useRef(false)

  // --- Submissions ---
  const [submissions, setSubmissions] = useState<Record<number, { verdict: string; score: number }>>({})
  const [submittingProblem, setSubmittingProblem] = useState<number | null>(null)

  // --- Anti-cheating ---
  const [violations, setViolations] = useState<ViolationType[]>([])
  const violationCountRef = useRef(0)
  const [showViolationModal, setShowViolationModal] = useState<string | null>(null)
  const bcRef = useRef<BroadcastChannel | null>(null)
  const tabIdRef = useRef('')

  // --- Editor ---
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const cmViewRef = useRef<EditorView | null>(null)
  const [language, setLanguage] = useState('JavaScript')
  const [userCode, setUserCode] = useState('')
  const userCodeFromCmRef = useRef(false)

  // --- Terminal ---
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(true)
  const [activeConsoleTab, setActiveConsoleTab] = useState<'Testcase' | 'Test Result'>('Testcase')
  const [customTestcaseInput, setCustomTestcaseInput] = useState('')
  const [customExpectedOutput, setCustomExpectedOutput] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null)

  // --- Layout ---
  const [splitPercent, setSplitPercent] = useState(50)
  const [terminalHeight, setTerminalHeight] = useState(200)
  const containerRef = useRef<HTMLDivElement>(null)
  const terminalContainerRef = useRef<HTMLDivElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // ====== AUTH ======
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setUserId(session.user.id)
        localStorage.setItem('codenode_profile_id', session.user.id)
        if (session.user.email && session.user.email.toLowerCase() === 'deepika.tiwari.1408@gmail.com') {
          setIsAdmin(true)
        }
      } else {
        const stored = localStorage.getItem('codenode_profile_id')
        if (stored) setUserId(stored)
      }
    })
  }, [])

  // ====== LOAD CONTEST ======
  useEffect(() => {
    if (!contestId) return
    const load = async () => {
      try {
        const res = await fetch(`/api/contests/${contestId}`)
        if (!res.ok) { setError('Contest not found'); setLoading(false); return }
        const data = await res.json()
        // Map contest data
        const mapped: ContestData = {
          id: data.id,
          title: data.title,
          description: data.description,
          durationMins: data.durationMins,
          maxPoints: data.maxPoints,
          maxViolations: data.maxViolations ?? 3,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
          problems: (data.problems || []).sort((a: ContestProblem, b: ContestProblem) => a.sortOrder - b.sortOrder),
        }
        setContest(mapped)

        // Map leetcodeIds to PROBLEMS_DATA
        const probIds = mapped.problems.map((cp) => cp.problem.leetcodeId)
        const matched = probIds
          .map((id) => PROBLEMS_DATA.find((p) => p.id === id))
          .filter((p): p is Problem => p !== undefined)
        setProblems(matched)

        // Compute phase
        computePhase(mapped)
      } catch (e) {
        setError('Failed to load contest')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [contestId])

  const computePhase = (c: ContestData) => {
    const now = Date.now()
    const startsAt = c.startsAt ? new Date(c.startsAt).getTime() : null
    const endsAt = c.endsAt ? new Date(c.endsAt).getTime() : null
    let phase: ContestPhase = 'before'
    if (startsAt && now < startsAt) phase = 'before'
    else if (endsAt && now > endsAt) phase = 'after'
    else if (startsAt && now >= startsAt && endsAt && now <= endsAt) phase = 'during'
    else if (startsAt && now >= startsAt) phase = 'during'
    setContestPhase(phase)
    phaseRef.current = phase
    if (endsAt) {
      const secsLeft = Math.max(0, Math.floor((endsAt - now) / 1000))
      setCountdownSecs(secsLeft)
    }
  }

  // ====== SESSION RESTORE / PRE-CHECK AUTO-SHOW ======
  useEffect(() => {
    if (!contest || !userId) return
    const stored = localStorage.getItem('codenode_contest_mode')
    if (stored) {
      const session = parseContestModeSession(stored)
      if (session.contestId === contestId && contestPhase === 'during') {
        contestStartedRef.current = true
        setContestRunning(true)
        setShowPreCheck(false)
        return
      }
    }
    // No valid session stored — auto-show pre-check during phase
    if (contestPhase === 'during') {
      setPreCheckStep('rules')
      setShowPreCheck(true)
    }
  }, [contest, userId, contestPhase, contestId])

  // ====== PERIODIC PHASE REFRESH ======
  const [contestRunning, setContestRunning] = useState(false)
  useEffect(() => {
    if (!contest || contestCompleted) return
    if (contestRunning) return
    const interval = setInterval(() => computePhase(contest), 10000)
    return () => clearInterval(interval)
  }, [contest, contestCompleted, contestRunning])

  // ====== TIMER ======
  useEffect(() => {
    if (!contest || !contestRunning || contestCompleted) return
    const timer = setInterval(() => {
      setCountdownSecs((prev) => {
        if (prev <= 1) {
          const wasDuring = phaseRef.current === 'during' && !isSubmittingRef.current
          computePhase(contest)
          if (wasDuring) handleFinalizeContest()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [contest, contestRunning, contestCompleted])

  // ====== FORMAT TIME ======
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // ====== CURRENT PROBLEM ======
  const currentProblem = problems[currentProblemIdx] || null
  const currentContestProblem = contest?.problems[currentProblemIdx] || null

  // ====== PROBLEM STATUS ======
  const problemStatus = useMemo(() => {
    const status: Record<number, 'unattempted' | 'attempted' | 'accepted'> = {}
    problems.forEach((p) => {
      const sub = submissions[p.id]
      if (sub?.verdict === 'accepted') status[p.id] = 'accepted'
      else if (sub) status[p.id] = 'attempted'
      else status[p.id] = 'unattempted'
    })
    return status
  }, [problems, submissions])

  const solvedCount = Object.values(problemStatus).filter((s) => s === 'accepted').length
  const attemptedCount = Object.values(problemStatus).filter((s) => s === 'attempted').length

  // ====== EVALUATE ======
  const handleEvaluate = async (action: 'run' | 'submit') => {
    if (isEvaluating || !currentProblem || !userId || !contest) return
    setIsEvaluating(true)
    setIsTerminalExpanded(true)
    setActiveConsoleTab('Test Result')
    setEvaluationResult(null)

    try {
      const isCustom = activeConsoleTab === 'Testcase' && customTestcaseInput.trim() !== ''
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: currentProblem.id,
          language,
          code: userCode,
          action,
          customInput: isCustom ? customTestcaseInput : undefined,
          customExpected: isCustom ? customExpectedOutput : undefined,
        }),
      })
      if (!res.ok) throw new Error(`Evaluation failed: ${res.status}`)
      const result: EvaluationResult = await res.json()
      setEvaluationResult(result)

      // On submit: if accepted, record contest submission
      if (action === 'submit') {
        if (result.status === 'Accepted') {
          await handleProblemSubmit(currentProblem.id, 'accepted', currentContestProblem?.points || 0)
        } else if (result.status === 'Wrong Answer' || result.status === 'Compile Error' || result.status === 'Runtime Error') {
          await handleProblemSubmit(currentProblem.id, result.status === 'Compile Error' ? 'compile_error' : result.status === 'Runtime Error' ? 'runtime_error' : 'wrong_answer', 0)
        }
      }
    } catch (err: any) {
      setEvaluationResult({
        status: 'Runtime Error',
        compileError: err.message || 'Evaluation failed',
        testResults: [],
      })
    } finally {
      setIsEvaluating(false)
    }
  }

  // ====== PROBLEM SUBMIT TO CONTEST ======
  const handleProblemSubmit = async (problemId: number, verdict: string, score: number) => {
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    setSubmittingProblem(problemId)
    try {
      const res = await fetch(`/api/contests/${contestId}/problems/${problemId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, verdict, score }),
      })
      if (res.ok) {
        const data = await res.json()
        setSubmissions((prev) => ({ ...prev, [problemId]: { verdict, score: data.submission?.score ?? score } }))

        // Single problem: auto-show End Test
        if (problems.length === 1 && verdict === 'accepted') {
          setTimeout(() => handleFinalizeContest(), 500)
        }
      }
    } catch (err) {
      console.error('Failed to submit:', err)
    } finally {
      setSubmittingProblem(null)
      isSubmittingRef.current = false
    }
  }

  // ====== END TEST ======
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)

  const handleFinalizeContest = async () => {
    if (isSubmittingRef.current || !userId || !contest) return
    if (contestCompleted) return
    isSubmittingRef.current = true
    setIsFinalizing(true)
    try {
      const res = await fetch(`/api/contests/${contestId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        const data = await res.json()
        setCompletionResult(data)
        setContestCompleted(true)
        setContestRunning(false)
        clearContestMode()
        // Fetch leaderboard
        const lbRes = await fetch(`/api/contests/${contestId}/leaderboard`)
        if (lbRes.ok) setLeaderboard(await lbRes.json())
        setShowLeaderboard(true)
      } else {
        const err = await res.json()
        console.error('Finalize failed:', err)
      }
    } catch (err) {
      console.error('Finalize error:', err)
    } finally {
      setIsFinalizing(false)
      isSubmittingRef.current = false
    }
  }

  const handleEndTest = () => {
    const unanswered = problems.filter((p) => !submissions[p.id] || submissions[p.id].verdict !== 'accepted')
    if (unanswered.length > 0) {
      setShowEndConfirm(true)
    } else {
      handleFinalizeContest()
    }
  }

  // ====== ANTI-CHEATING ======
  const recordViolation = async (type: ViolationType) => {
    if (!contestStartedRef.current || !userId || !contest) return
    setViolations((prev) => [...prev, type])
    violationCountRef.current += 1
    setShowViolationModal(type)

    try {
      await fetch(`/api/contests/${contestId}/violations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type }),
      })
    } catch { /* silent */ }

    if (violationCountRef.current >= (contest?.maxViolations ?? 3)) {
      if (!isSubmittingRef.current) {
        handleFinalizeContest()
      }
    }
  }

  const clearContestMode = () => {
    contestStartedRef.current = false
    setContestRunning(false)
    localStorage.removeItem('codenode_contest_mode')
    if (bcRef.current) {
      bcRef.current.close()
      bcRef.current = null
    }
    try { document.exitFullscreen() } catch { /* ok */ }
  }

  useEffect(() => {
    if (!contestRunning || contestCompleted) return

    // Fullscreen detection
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        recordViolation('fullscreen_exit')
      }
    }
    document.addEventListener('fullscreenchange', handleFsChange)

    // Tab visibility
    const handleVisibility = () => {
      if (document.hidden) recordViolation('tab_switch')
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Window blur
    const handleBlur = () => recordViolation('tab_switch')
    window.addEventListener('blur', handleBlur)

    // Cross-tab
    const tabId = crypto.randomUUID?.() || Math.random().toString(36)
    tabIdRef.current = tabId
    try {
      const bc = new BroadcastChannel('codenode-contest')
      bcRef.current = bc
      bc.postMessage({ type: 'started', contestId, tabId })
      bc.onmessage = (event) => {
        if (event.data.type === 'started' && event.data.tabId !== tabId && event.data.contestId === contestId) {
          recordViolation('tab_switch')
        }
      }
    } catch { /* broadcast channel not supported */ }

    // Storage cross-tab
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'codenode_contest_mode' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue)
          if (data.contestId === contestId) recordViolation('tab_switch')
        } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', handleStorage)

    // Beforeunload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (bcRef.current) bcRef.current.close()
    }
  }, [contestRunning, contestCompleted])

  // ====== PRE-CHECK DIALOG ======
  const [preCheckStep, setPreCheckStep] = useState<'rules' | 'verify'>('rules')

  const startContest = async () => {
    if (!userId || !contest) return
    setPreCheckVerifying(true)
    setPreCheckError(null)

    try {
      // 1. Check existing session — if stale (different contest), clear it silently
      const stored = localStorage.getItem('codenode_contest_mode')
      if (stored) {
        const session = parseContestModeSession(stored)
        if (session.contestId !== contestId) {
          localStorage.removeItem('codenode_contest_mode')
        }
      }

      // 2. Full-screen
      try {
        await document.documentElement.requestFullscreen()
        await new Promise((r) => setTimeout(r, 400))
      } catch {
        setPreCheckError('Full-screen mode is required for the contest. Please allow full-screen access.')
        setPreCheckVerifying(false)
        return
      }

      // 3. Server start API
      const res = await fetch(`/api/contests/${contestId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (!res.ok) {
        const err = await res.json()
        setPreCheckError(err.error || 'Failed to start contest')
        setPreCheckVerifying(false)
        return
      }

      // All checks passed
      contestStartedRef.current = true
      setContestRunning(true)
      localStorage.setItem('codenode_contest_mode', JSON.stringify({ contestId, startedAt: new Date().toISOString() }))
      setShowPreCheck(false)
      setPreCheckStep('rules')
    } catch (err: any) {
      setPreCheckError(err.message || 'Verification failed')
    } finally {
      setPreCheckVerifying(false)
    }
  }

  // ====== CODEMIRROR SETUP ======
  useEffect(() => {
    if (!editorContainerRef.current || !currentProblem) return
    cmViewRef.current?.destroy()

    const savedKey = `leetcode_code_${currentProblem.id}_${language}`
    let initialCode = ''
    try { initialCode = localStorage.getItem(savedKey) ?? '' } catch { /* ok */ }
    if (!initialCode) {
      initialCode = currentProblem.starterCode[language] || currentProblem.starterCode['C++'] || ''
    }

    const state = EditorState.create({
      doc: initialCode,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        drawSelection(),
        highlightSpecialChars(),
        EditorState.allowMultipleSelections.of(true),
        history(),
        indentOnInput(),
        bracketMatching(),
        foldGutter(),
        keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap]),
        getLangExt(language),
        lintGutter(),
        syntaxErrorLinter,
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            userCodeFromCmRef.current = true
            setUserCode(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          '&': { backgroundColor: '#0a0a0a' },
          '.cm-scroller': { fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', lineHeight: '21px' },
          '.cm-content': { padding: '16px', caretColor: '#f5f5f5' },
          '.cm-gutters': { backgroundColor: '#111', borderRight: '1px solid #1e1e1e' },
          '.cm-lineNumbers .cm-gutterElement': { paddingLeft: '12px', paddingRight: '12px', color: '#555', fontSize: '11px' },
          '.cm-activeLine': { backgroundColor: 'transparent' },
          '.cm-activeLineGutter': { backgroundColor: '#1a1a1a' },
          '.cm-cursor': { borderLeftColor: '#f5f5f5' },
          '.cm-selectionBackground': { backgroundColor: 'rgba(255,255,255,0.08)' },
        }),
        ...(contestRunning && !contestCompleted ? [
          EditorView.domEventHandlers({
            paste: (e) => { e.preventDefault(); recordViolation('paste_attempt'); return true },
            cut: (e) => { e.preventDefault(); return true },
            copy: (e) => { e.preventDefault(); return true },
          }),
        ] : []),
      ],
    })

    cmViewRef.current = new EditorView({ state, parent: editorContainerRef.current })
    setUserCode(initialCode)

    // Set default testcase
    if (currentProblem.testcases && currentProblem.testcases.length > 0) {
      setCustomTestcaseInput(currentProblem.testcases[0].input)
    }
    setEvaluationResult(null)

    return () => {
      cmViewRef.current?.destroy()
      cmViewRef.current = null
    }
  }, [currentProblem?.id, language, contestRunning, contestCompleted])

  // Auto-save
  useEffect(() => {
    if (!currentProblem) return
    const timeout = setTimeout(() => {
      localStorage.setItem(`leetcode_code_${currentProblem.id}_${language}`, userCode)
    }, 600)
    return () => clearTimeout(timeout)
  }, [userCode, currentProblem?.id, language])

  // Sync external userCode into CM
  useEffect(() => {
    if (userCodeFromCmRef.current) {
      userCodeFromCmRef.current = false
      return
    }
    const view = cmViewRef.current
    if (!view) return
    const curDoc = view.state.doc.toString()
    if (curDoc !== userCode) {
      view.dispatch({ changes: { from: 0, to: curDoc.length, insert: userCode } })
    }
  }, [userCode])

  // ====== LAYOUT HANDLERS ======
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const handleMove = (me: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const next = ((me.clientX - rect.left) / rect.width) * 100
        if (next > 15 && next < 85) setSplitPercent(next)
      }
    }
    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }

  const handleTerminalMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const startY = e.clientY
    const startH = terminalHeight
    const handleMove = (me: MouseEvent) => {
      const delta = startY - me.clientY
      if (terminalContainerRef.current) {
        const parent = terminalContainerRef.current.parentElement
        if (parent) {
          const maxH = parent.clientHeight - 48
          setTerminalHeight(Math.min(Math.max(startH + delta, 60), maxH))
        }
      }
    }
    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }

  const handleResetSnippet = () => {
    if (!currentProblem) return
    if (window.confirm('Reset code to default?')) {
      const defaultCode = currentProblem.starterCode[language] || currentProblem.starterCode['C++'] || ''
      setUserCode(defaultCode)
      localStorage.removeItem(`leetcode_code_${currentProblem.id}_${language}`)
    }
  }

  // ====== RENDER ======
  if (loading) {
    return (
      <div className="h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (error || !contest) {
    return (
      <div className="h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center">
        <div className="text-center flex flex-col gap-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <p className="text-sm font-mono text-[#888]">{error || 'Contest not found'}</p>
          <button onClick={() => router.push('/test-arena')} className="text-xs text-emerald-500 hover:underline">Back to Test Arena</button>
        </div>
      </div>
    )
  }

  // Contest before phase - show waiting screen
  if (contestPhase === 'before' && !contestStartedRef.current && !showPreCheck) {
    return (
      <div className="h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center">
        <div className="text-center flex flex-col gap-4 max-w-md">
          <Clock className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="text-lg font-bold">{contest.title}</h1>
          <p className="text-sm text-[#888]">
            {contest.description || 'Contest not yet started. Please wait.'}
          </p>
          {contest.startsAt && (
            <p className="text-xs font-mono text-[#666]">
              Starts at: {new Date(contest.startsAt).toLocaleString()} &mdash; The page will update automatically when the contest begins.
            </p>
          )}
          <button onClick={() => router.push('/test-arena')} className="text-xs text-[#666] hover:text-[#f5f5f5]">Back to Test Arena</button>
        </div>
      </div>
    )
  }



  // Contest after phase - show results
  if (contestPhase === 'after' && !contestCompleted && !contestStartedRef.current) {
    return (
      <div className="h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center">
        <div className="text-center flex flex-col gap-4 max-w-md">
          <Trophy className="w-12 h-12 text-emerald-500 mx-auto" />
          <h1 className="text-lg font-bold">{contest.title}</h1>
          <p className="text-sm text-[#888]">This contest has ended.</p>
          <button onClick={() => router.push('/test-arena')} className="text-xs text-emerald-500 hover:underline">Back to Test Arena</button>
        </div>
      </div>
    )
  }

  // Admin users cannot participate in contests
  if (isAdmin) {
    return (
      <div className="h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center">
        <div className="text-center flex flex-col gap-4 max-w-md">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="text-lg font-bold">{contest.title}</h1>
          <p className="text-sm text-[#888]">
            Admin accounts cannot participate in contests. Please use a student account.
          </p>
          <button onClick={() => router.push('/admin/contests')} className="text-xs text-emerald-500 hover:underline">
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ====== MAIN CONTEST WORKSPACE ======
  return (
    <div className="h-screen bg-[#0a0a0a] text-[#f5f5f5] flex flex-col overflow-hidden">

      {/* === TOP BAR: timer + contest info + end test === */}
      <div className="flex items-center justify-between bg-[#111] border-b border-[#1e1e1e] px-4 py-2 text-xs shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/test-arena')}
            className="text-[#888] hover:text-[#f5f5f5] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-[#f5f5f5]">{contest.title}</span>
          <div className="h-3 w-px bg-[#2a2a2a]" />
          <div className={`flex items-center gap-1.5 font-mono font-bold ${
            countdownSecs < 300 ? 'text-red-500' : 'text-emerald-500'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(countdownSecs)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#888] font-mono text-[10px]">
            Solved: {solvedCount}/{problems.length}
          </span>
          {contestStartedRef.current && !contestCompleted && (
            <button onClick={handleEndTest} disabled={isFinalizing}
              className="bg-rose-500 hover:bg-rose-600 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
              {isFinalizing ? <Loader2 className="w-3 h-3 animate-spin inline" /> : null}
              End Test
            </button>
          )}
        </div>
      </div>

      {/* === MAIN BODY === */}
      <div ref={containerRef} className="flex flex-1 h-0 w-full relative overflow-hidden">

        {/* === SIDEBAR: Problem Navigator === */}
        {sidebarOpen && contestStartedRef.current && !contestCompleted && (
          <div className="w-56 bg-[#111] border-r border-[#1e1e1e] flex flex-col shrink-0 overflow-y-auto">
            <div className="p-3 border-b border-[#1e1e1e]">
              <h3 className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Problems</h3>
              <div className="flex gap-2 mt-1.5 text-[10px] font-mono">
                <span className="text-emerald-500">✓ {solvedCount}</span>
                <span className="text-amber-500">~ {attemptedCount}</span>
                <span className="text-[#666]">{problems.length - solvedCount - attemptedCount} left</span>
              </div>
            </div>
            <div className="flex flex-col p-2 gap-0.5">
              {problems.map((p, idx) => {
                const status = problemStatus[p.id]
                return (
                  <button key={p.id}
                    onClick={() => setCurrentProblemIdx(idx)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                      idx === currentProblemIdx
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'text-[#aaa] hover:bg-[#1a1a1a] hover:text-[#f5f5f5]'
                    }`}>
                    <span className="text-[10px] font-mono text-[#666] w-5">{idx + 1}.</span>
                    <span className="flex-1 truncate">{p.title}</span>
                    {status === 'accepted' && <Check className="w-3 h-3 text-emerald-500 shrink-0" />}
                    {status === 'attempted' && <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* === LEFT PANEL: Problem Description === */}
        {currentProblem && (
          <div className="h-full flex flex-col bg-[#111] border-r border-[#1e1e1e]"
            style={{ width: contestStartedRef.current && !contestCompleted && sidebarOpen ? `${splitPercent}%` : '50%' }}>
            <div className="flex-1 overflow-y-auto p-5 font-sans flex flex-col gap-5">
              {/* Header */}
              <div>
                <h1 className="text-lg font-bold text-[#f5f5f5]">{currentProblem.id}. {currentProblem.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    currentProblem.difficulty === 'Easy' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' :
                    currentProblem.difficulty === 'Medium' ? 'text-amber-500 border-amber-500/20 bg-amber-500/10' :
                    'text-red-500 border-red-500/20 bg-red-500/10'
                  }`}>{currentProblem.difficulty}</span>
                  <span className="text-[10px] font-mono text-[#666]">
                    {currentContestProblem?.points || 0} pts
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-[#ccc] leading-relaxed flex flex-col gap-3">
                {currentProblem.description.split('\n\n').map((para, i) => {
                  const processed = para.replace(/`([^`]+)`/g, '<code class="font-mono bg-[#1a1a1a] px-1.5 py-0.5 rounded text-emerald-400 text-[10px]">$1</code>')
                  return <p key={i} dangerouslySetInnerHTML={{ __html: processed }} />
                })}
              </div>

              {/* Examples */}
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-mono text-[#666] uppercase tracking-wider">Examples</p>
                {currentProblem.examples.map((ex, idx) => (
                  <div key={idx} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl p-4 flex flex-col gap-2 text-xs font-mono">
                    <p className="font-bold text-[#f5f5f5]">Example {idx + 1}:</p>
                    <div className="flex flex-col gap-1 pl-2 border-l-2 border-[#2a2a2a] text-[#aaa]">
                      <div><span className="text-[#666]">Input:</span> {ex.input}</div>
                      <div><span className="text-[#666]">Output:</span> {ex.output}</div>
                      {ex.explanation && <div className="mt-1"><span className="text-[#666]">Explanation:</span> {ex.explanation}</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Constraints */}
              {currentProblem.topics && currentProblem.topics.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-mono text-[#666] uppercase tracking-wider">Topics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentProblem.topics.map((t) => (
                      <span key={t} className="text-[10px] bg-[#1a1a1a] text-[#aaa] px-2 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Problem Navigation Buttons */}
            {contestStartedRef.current && !contestCompleted && (
              <div className="border-t border-[#1e1e1e] px-4 py-2 flex items-center justify-between bg-[#0a0a0a]">
                <button onClick={() => setCurrentProblemIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentProblemIdx === 0}
                  className="flex items-center gap-1 text-[10px] font-mono text-[#888] hover:text-[#f5f5f5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ArrowLeft className="w-3 h-3" /> Previous
                </button>
                <span className="text-[10px] font-mono text-[#666]">
                  {currentProblemIdx + 1} / {problems.length}
                </span>
                <button onClick={() => setCurrentProblemIdx((prev) => Math.min(problems.length - 1, prev + 1))}
                  disabled={currentProblemIdx === problems.length - 1}
                  className="flex items-center gap-1 text-[10px] font-mono text-[#888] hover:text-[#f5f5f5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  Next <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* === RESIZE HANDLE === */}
        <div className="w-1.5 bg-[#111] hover:bg-emerald-500/40 active:bg-emerald-500 cursor-col-resize transition-colors shrink-0"
          onMouseDown={handleMouseDown} />

        {/* === RIGHT PANEL: Code Editor + Terminal === */}
        <div className="h-full flex flex-col bg-[#0a0a0a]" style={{ flex: 1 }}>
          {/* Editor Header */}
          <div className="flex items-center justify-between border-b border-[#1e1e1e] bg-[#111] px-4 py-2 text-xs shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <select value={language} onChange={(e) => setLanguage(e.target.value)}
                  className="bg-[#0a0a0a] border border-[#1e1e1e] rounded text-xs text-[#f5f5f5] px-3 py-1 pr-6 cursor-pointer appearance-none font-mono outline-none focus:border-emerald-500/50">
                  {['JavaScript', 'Python', 'C++', 'Java', 'Go'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#666] pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#888]">
              <button onClick={handleResetSnippet} title="Reset code"
                className="hover:text-[#f5f5f5] hover:bg-[#1a1a1a] p-1.5 rounded transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CodeMirror */}
          <div className="flex-1 overflow-auto relative" style={{ minHeight: 0 }}>
            <div ref={editorContainerRef} className="absolute inset-0" />
          </div>

          {/* Terminal drag handle */}
          <div className="h-1.5 bg-[#111] hover:bg-emerald-500/30 active:bg-emerald-500 cursor-row-resize transition-colors shrink-0"
            onMouseDown={handleTerminalMouseDown} />

          {/* Terminal */}
          <div ref={terminalContainerRef}
            className="border-t border-[#1e1e1e] bg-[#111] flex flex-col overflow-hidden shrink-0"
            style={{ height: isTerminalExpanded ? `${terminalHeight}px` : '40px' }}>

            <div onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
              className="flex items-center justify-between px-4 h-10 border-b border-[#1e1e1e] hover:bg-[#1a1a1a] transition-colors cursor-pointer select-none text-xs shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[#f5f5f5] font-mono">
                  <Terminal className="w-4 h-4 text-[#888]" />
                  <span>Terminal</span>
                </div>
                <div className="h-3 w-px bg-[#2a2a2a]" />
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  {(['Testcase', 'Test Result'] as const).map((tab) => (
                    <button key={tab} onClick={() => { setActiveConsoleTab(tab); setIsTerminalExpanded(true) }}
                      className={`font-mono transition-colors py-1 ${
                        activeConsoleTab === tab ? 'text-[#f5f5f5] font-bold' : 'text-[#888] hover:text-[#f5f5f5]'
                      }`}>{tab}</button>
                  ))}
                </div>
              </div>
              {isTerminalExpanded ? <ChevronDown className="w-4 h-4 text-[#888]" /> : <ChevronUp className="w-4 h-4 text-[#888]" />}
            </div>

            {isTerminalExpanded && (
              <div className="flex-1 p-4 overflow-y-auto bg-[#0a0a0a] text-xs font-mono min-h-0">
                {activeConsoleTab === 'Testcase' ? (
                  <div className="flex flex-col gap-3">
                    <span className="text-[#888]">Enter testcase parameters:</span>
                    <textarea value={customTestcaseInput} onChange={(e) => setCustomTestcaseInput(e.target.value)}
                      placeholder='[2,7,11,15]&#10;9'
                      spellCheck={false}
                      className="w-full h-24 bg-[#111] border border-[#1e1e1e] focus:border-emerald-500/50 focus:outline-none rounded-lg p-3 text-emerald-400 placeholder-[#333] text-xs" />
                    <span className="text-[10px] text-[#666]">Each line is one function argument in JSON format.</span>
                    <span className="text-[#888]">Expected output:</span>
                    <textarea value={customExpectedOutput} onChange={(e) => setCustomExpectedOutput(e.target.value)}
                      placeholder='[0,1]'
                      spellCheck={false}
                      className="w-full h-12 bg-[#111] border border-[#1e1e1e] focus:border-emerald-500/50 focus:outline-none rounded-lg p-3 text-emerald-400 placeholder-[#333] text-xs" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {isEvaluating ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3 text-[#888]">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                        <span>Compiling and evaluating...</span>
                      </div>
                    ) : evaluationResult ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[#888]">Status:</span>
                            <span className={`text-sm font-bold uppercase tracking-wider ${
                              evaluationResult.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-500'
                            }`}>{evaluationResult.status}</span>
                          </div>
                          {evaluationResult.status === 'Accepted' && (
                            <div className="flex items-center gap-3 text-[#888] text-[10px]">
                              <span>Runtime: <strong className="text-emerald-400">{evaluationResult.runtime}</strong></span>
                              <span>Memory: <strong className="text-emerald-400">{evaluationResult.memory}</strong></span>
                            </div>
                          )}
                        </div>
                        {evaluationResult.compileError && (
                          <div className="bg-rose-950/20 border border-rose-900/30 p-3.5 rounded-lg text-rose-300 overflow-x-auto text-[11px]">
                            <div className="flex items-center gap-2 mb-1 text-rose-400 font-bold">
                              <AlertCircle className="w-4 h-4" />
                              <span>Compilation Error:</span>
                            </div>
                            <pre>{evaluationResult.compileError}</pre>
                          </div>
                        )}
                        {evaluationResult.testResults && evaluationResult.testResults.length > 0 && (
                          <div className="flex flex-col gap-3">
                            {evaluationResult.testResults.map((tr, idx) => (
                              <div key={idx}
                                className={`border rounded-lg p-3 ${
                                  tr.passed ? 'border-[#1e1e1e] bg-[#111]/30' : 'border-rose-900/20 bg-rose-950/5'
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-bold text-xs text-[#888]">Testcase {idx + 1}:</span>
                                  <span className={`text-[10px] font-bold ${tr.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {tr.passed ? '✓ PASSED' : '✗ FAILED'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[11px]">
                                  <div className="bg-[#0a0a0a] p-2 rounded">
                                    <span className="text-[#666] block text-[9px] mb-0.5 uppercase font-mono">Input:</span>
                                    <span className="text-[#f5f5f5]">{tr.input}</span>
                                  </div>
                                  <div className="bg-[#0a0a0a] p-2 rounded">
                                    <span className="text-[#666] block text-[9px] mb-0.5 uppercase font-mono">Expected:</span>
                                    <span className="text-emerald-400">{tr.expected}</span>
                                  </div>
                                  <div className="bg-[#0a0a0a] p-2 rounded">
                                    <span className="text-[#666] block text-[9px] mb-0.5 uppercase font-mono">Actual:</span>
                                    <span className={tr.passed ? 'text-emerald-400' : 'text-rose-400'}>{tr.actual}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-[#888]">Compile and run your code using "Run" or "Submit".</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom toolbar */}
            <div className="border-t border-[#1e1e1e] bg-[#111] px-4 py-2 flex items-center justify-between text-xs h-12 shrink-0">
              <button onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
                className="flex items-center gap-1.5 text-[#888] hover:text-[#f5f5f5] transition-colors">
                <span>Console</span>
                {isTerminalExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEvaluate('run')} disabled={isEvaluating || !contestStartedRef.current || contestCompleted}
                  className="flex items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#f5f5f5] px-4 py-2 rounded-lg font-mono font-semibold transition-colors disabled:opacity-50">
                  <Play className="w-3.5 h-3.5" />
                  <span>Run</span>
                </button>
                <button onClick={() => handleEvaluate('submit')} disabled={isEvaluating || !contestStartedRef.current || contestCompleted}
                  className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-black px-5 py-2 rounded-lg font-mono font-bold transition-colors disabled:opacity-50">
                  {isEvaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Submit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === VIOLATION MODAL === */}
      {showViolationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 max-w-sm w-full mx-4 text-center flex flex-col gap-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-sm font-bold text-[#f5f5f5]">Warning!</h3>
            <p className="text-xs text-[#aaa]">
              {showViolationModal === 'fullscreen_exit' && 'You exited full-screen mode. This is a violation.'}
              {showViolationModal === 'tab_switch' && 'You switched tabs or windows. This is a violation.'}
              {showViolationModal === 'paste_attempt' && 'Copy/Paste is disabled during the contest.'}
            </p>
            <p className="text-xs text-[#888] font-mono">
              Violation {violationCountRef.current} / {contest?.maxViolations ?? 3}
            </p>
            <button onClick={() => {
              setShowViolationModal(null)
              if (showViolationModal === 'fullscreen_exit') {
                document.documentElement.requestFullscreen().catch(() => {})
              }
            }}
              className="bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold px-4 py-2 rounded-lg mx-auto transition-colors">
              {violationCountRef.current >= (contest?.maxViolations ?? 3) ? 'Submitting...' : 'Dismiss'}
            </button>
          </div>
        </div>
      )}

      {/* === END TEST CONFIRMATION === */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 max-w-md w-full mx-4 flex flex-col gap-4">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-sm font-bold text-[#f5f5f5] text-center">End Test?</h3>
            <p className="text-xs text-[#aaa] text-center">
              You have {problems.length - solvedCount} unanswered problem{problems.length - solvedCount !== 1 ? 's' : ''} remaining.
              {problems.length - attemptedCount - solvedCount > 0 && (
                <span className="block mt-1">
                  {problems.length - attemptedCount - solvedCount} problem{problems.length - attemptedCount - solvedCount !== 1 ? 's' : ''} not yet attempted.
                </span>
              )}
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowEndConfirm(false)}
                className="text-xs font-bold px-4 py-2 rounded-lg border border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] transition-colors">
                Continue Solving
              </button>
              <button onClick={() => { setShowEndConfirm(false); handleFinalizeContest() }}
                className="bg-rose-500 hover:bg-rose-600 text-black text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                End Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === PRE-CHECK DIALOG === */}
      {showPreCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 max-w-lg w-full mx-4 flex flex-col gap-4">
            <h3 className="text-base font-bold text-[#f5f5f5]">{contest.title}</h3>

            {preCheckStep === 'rules' ? (
              <>
                <div className="flex flex-col gap-2 text-xs text-[#aaa] bg-[#0a0a0a] rounded-lg p-4 border border-[#1e1e1e]">
                  <p className="font-bold text-[#f5f5f5] mb-1">Contest Rules:</p>
                  <p>1. You must remain in full-screen mode throughout the contest.</p>
                  <p>2. Switching tabs or windows will be recorded as a violation.</p>
                  <p>3. Copy/Paste is disabled during the contest.</p>
                  <p>4. After {contest?.maxViolations ?? 3} violations, your test will be auto-submitted.</p>
                  <p>5. Do not close the browser or refresh unnecessarily.</p>
                  <p>6. All submissions are final once the contest ends.</p>
                </div>
                <button onClick={() => setPreCheckStep('verify')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold px-4 py-2 rounded-lg mx-auto transition-colors">
                  I Understand, Continue
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-[#aaa]">Verifying contest environment...</p>
                {preCheckVerifying ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                  </div>
                ) : preCheckError ? (
                  <div className="bg-rose-950/20 border border-rose-900/30 rounded-lg p-3 text-rose-300 text-xs">
                    {preCheckError}
                  </div>
                ) : null}
                {!preCheckVerifying && (
                  <div className="flex justify-center gap-3">
                    <button onClick={() => { setPreCheckError(null); setPreCheckStep('rules') }}
                      className="text-xs font-bold px-3 py-2 rounded-lg border border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] transition-colors">
                      Back
                    </button>
                    <button onClick={startContest} disabled={preCheckVerifying}
                      className="bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                      {preCheckVerifying ? 'Verifying...' : 'Start Contest'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* === RESULTS SCREEN === */}
      {contestCompleted && completionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 overflow-y-auto">
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 max-w-lg w-full mx-4 my-8 flex flex-col gap-5">
            <div className="text-center flex flex-col gap-2">
              <Trophy className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-[#f5f5f5]">Assessment Completed Successfully</h3>
              <p className="text-xs text-[#aaa]">Your submissions have been saved.</p>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#888] block">Total Score</span>
                <span className="text-xl font-bold text-emerald-500">{completionResult.score}</span>
              </div>
              <div>
                <span className="text-[#888] block">Solved</span>
                <span className="text-xl font-bold text-[#f5f5f5]">{completionResult.solved}/{completionResult.totalProblems}</span>
              </div>
              <div>
                <span className="text-[#888] block">Failed</span>
                <span className="text-xl font-bold text-rose-500">{completionResult.failed}</span>
              </div>
              <div>
                <span className="text-[#888] block">Time Taken</span>
                <span className="text-xl font-bold text-[#f5f5f5]">
                  {Math.floor(completionResult.timeTakenMs / 60000)}m {Math.floor((completionResult.timeTakenMs % 60000) / 1000)}s
                </span>
              </div>
            </div>

            <p className="text-[10px] text-emerald-500 text-center bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2">
              All anti-cheating protections have been disabled. No further violations will be recorded. You may now safely close the exam.
            </p>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-bold text-[#f5f5f5] flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" /> Leaderboard
                </h4>
                <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#1e1e1e] text-[10px] text-[#666] font-mono uppercase">
                        <th className="py-2 px-3 text-left">Rank</th>
                        <th className="py-2 px-3 text-left">Name</th>
                        <th className="py-2 px-3 text-right">Score</th>
                        <th className="py-2 px-3 text-right">Solved</th>
                        <th className="py-2 px-3 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry) => (
                        <tr key={entry.rank} className={`border-b border-[#1e1e1e]/50 ${
                          entry.rank === 1 ? 'bg-amber-500/5' :
                          entry.rank === 2 ? 'bg-gray-500/5' :
                          entry.rank === 3 ? 'bg-amber-600/5' : ''
                        }`}>
                          <td className="py-2 px-3 font-mono font-bold">{entry.rank}</td>
                          <td className="py-2 px-3">{entry.name}</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-500">{entry.score}</td>
                          <td className="py-2 px-3 text-right font-mono">{entry.solved}</td>
                          <td className="py-2 px-3 text-right font-mono text-[#888]">
                            {entry.timeTaken ? `${Math.floor(entry.timeTaken / 60)}m ${entry.timeTaken % 60}s` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button onClick={() => router.push('/test-arena')}
              className="bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold px-4 py-2 rounded-lg mx-auto transition-colors">
              Back to Test Arena
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
