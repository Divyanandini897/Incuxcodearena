'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Play, 
  Check, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Settings, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  Clock, 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  Globe, 
  Lightbulb, 
  Loader2, 
  AlertCircle,
  Star 
} from 'lucide-react';
import { Problem, EvaluationResult, EditorialResponse, HintResponse } from '../types';
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection, highlightSpecialChars } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { indentOnInput, bracketMatching, foldGutter, foldKeymap, syntaxTree } from '@codemirror/language';
import { linter, lintGutter } from '@codemirror/lint';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { go } from '@codemirror/lang-go';
import { oneDark } from '@codemirror/theme-one-dark';

interface WorkspaceProps {
  problemId: number;
  problems: Problem[];
  solvedProblemIds: number[];
  onBackToDashboard: () => void;
  onMarkSolved: (id: number) => void;
  userId?: string | null;
}

export default function Workspace({ 
  problemId, 
  problems, 
  solvedProblemIds, 
  onBackToDashboard, 
  onMarkSolved,
  userId
}: WorkspaceProps) {
  const problem = problems.find((p) => p.id === problemId);
  if (!problem) return null;

  // Layout Splitting
  const [splitPercent, setSplitPercent] = useState(50);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const cmViewRef = useRef<EditorView | null>(null);
  const userCodeFromCmRef = useRef(false);
  const [isIdeFullscreen, setIsIdeFullscreen] = useState(false);

  // Tabs Left Panel
  const [activeTab, setActiveTab] = useState<'Description' | 'Editorial' | 'Solutions' | 'Submissions'>('Description');

  // Bookmarks state
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('codenode_bookmarks');
    if (saved) {
      const parsed: number[] = JSON.parse(saved);
      setIsBookmarked(parsed.includes(problemId));
    }
  }, [problemId]);

  const handleToggleBookmark = () => {
    const saved = localStorage.getItem('codenode_bookmarks');
    let current: number[] = saved ? JSON.parse(saved) : [];
    if (current.includes(problemId)) {
      current = current.filter(x => x !== problemId);
      setIsBookmarked(false);
    } else {
      current.push(problemId);
      setIsBookmarked(true);
    }
    localStorage.setItem('codenode_bookmarks', JSON.stringify(current));
  };

  // Interactive Metadata States
  const [showTopics, setShowTopics] = useState(false);
  const [showCompanies, setShowCompanies] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [upvotes, setUpvotes] = useState(1420);
  const [downvotes, setDownvotes] = useState(25);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);

  // IDE Editor State
  const [language, setLanguage] = useState('JavaScript');
  const [userCode, setUserCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);


  // CodeMirror: language extension mapping
  const getLangExt = (lang: string) => {
    switch (lang) {
      case 'JavaScript': return javascript();
      case 'Python': return python();
      case 'Java': return java();
      case 'C++': return cpp();
      case 'Go': return go();
      default: return javascript();
    }
  };

  // Generic syntax-error linter for any Lezer-based grammar
  const syntaxErrorLinter = linter((view) => {
    const tree = syntaxTree(view.state);
    const diagnostics: { from: number; to: number; message: string; severity: 'error' }[] = [];
    tree.iterate({
      enter: (node) => {
        if (node.type.isError) {
          const from = node.from;
          const to = node.to;
          const text = view.state.sliceDoc(from, to).slice(0, 30);
          diagnostics.push({
            from,
            to: to > from ? to : from + 1,
            message: text ? `Syntax error: unexpected "${text}"` : 'Syntax error',
            severity: 'error',
          });
        }
      },
    });
    return diagnostics;
  });

  // Synchronize language from URL parameter on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlLang = searchParams.get('lang')?.toLowerCase();
      if (urlLang) {
        const langMap: Record<string, string> = {
          javascript: 'JavaScript',
          python: 'Python',
          java: 'Java',
          cpp: 'C++',
          go: 'Go',
        };
        const mappedLang = langMap[urlLang];
        if (mappedLang) {
          setLanguage(mappedLang);
        }
      }
    }
  }, []);

  // Terminal & Execution State
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(true);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'Testcase' | 'Test Result'>('Testcase');
  const [customTestcaseInput, setCustomTestcaseInput] = useState('');
  const [customExpectedOutput, setCustomExpectedOutput] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [editorialData, setEditorialData] = useState<EditorialResponse | null>(null);
  const [isLoadingEditorial, setIsLoadingEditorial] = useState(false);

  // Local submission history
  const [submissionHistory, setSubmissionHistory] = useState<{
    timestamp: string;
    status: string;
    runtime: string;
    memory: string;
    language: string;
  }[]>([]);


  // Fetch submission history from DB on mount
  useEffect(() => {
    if (userId) {
      fetch(`/api/submissions?userId=${userId}&problemId=${problem.id}`)
        .then((r) => r.ok ? r.json() : { submissions: [] })
        .then((data) => {
          const dbSubs = (data.submissions || []).map((s: { status: string; runtime: string | null; memory: string | null; language: string; createdAt: string }) => ({
            timestamp: new Date(s.createdAt).toLocaleString(),
            status: s.status,
            runtime: s.runtime || '4ms',
            memory: s.memory || '10.2MB',
            language: s.language,
          }));
          setSubmissionHistory((prev) => {
            const combined = [...dbSubs, ...prev];
            const seen = new Set();
            return combined.filter((s) => {
              const key = `${s.timestamp}-${s.status}-${s.runtime}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          });
        })
        .catch(() => {});
    }
  }, [userId, problem.id]);

  // CodeMirror: create/recreate editor when language or problem changes
  useEffect(() => {
    if (!editorContainerRef.current) return;

    cmViewRef.current?.destroy();

    const savedCodeKey = `leetcode_code_${problemId}_${language}`;
    let initialCode: string;
    try {
      initialCode = localStorage.getItem(savedCodeKey) ?? '';
    } catch {
      initialCode = '';
    }
    if (!initialCode) {
      if (problem.difficulty === 'Easy' || problem.difficulty === 'Medium') {
        initialCode = '';
      } else {
        initialCode = problem.starterCode[language] || problem.starterCode['C++'] || '';
      }
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
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            userCodeFromCmRef.current = true;
            setUserCode(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': { backgroundColor: 'var(--color-code)' },
          '.cm-scroller': { fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', lineHeight: '21px' },
          '.cm-content': { padding: '16px 16px 16px 8px', caretColor: 'var(--color-code-text)' },
          '.cm-gutters': { backgroundColor: 'var(--color-line-num)', borderRight: '1px solid var(--color-border-subtle)' },
          '.cm-lineNumbers .cm-gutterElement': { paddingLeft: '12px', paddingRight: '12px', color: 'var(--color-line-text)', fontSize: '11px' },
          '.cm-activeLine': { backgroundColor: 'transparent' },
          '.cm-activeLineGutter': { backgroundColor: 'transparent' },
          '.cm-cursor': { borderLeftColor: 'var(--color-code-text)' },
          '.cm-selectionBackground': { backgroundColor: 'rgba(255,255,255,0.08)' },
          '.cm-foldGutter .cm-gutterElement': { color: 'var(--color-line-text)' },
        }),
      ],
    });

    cmViewRef.current = new EditorView({ state, parent: editorContainerRef.current });
    setUserCode(initialCode);

    // Contest mode anti-cheat: block paste, copy, cut, select-all, right-click, drag-drop
    const contestMode = typeof window !== 'undefined' ? localStorage.getItem('codenode_contest_mode') : null;
    const cleanups: (() => void)[] = [];
    if (contestMode && editorContainerRef.current) {
      const el = editorContainerRef.current;
      // Block paste
      const pasteHandler = (e: Event) => { e.preventDefault(); e.stopPropagation(); };
      el.addEventListener('paste', pasteHandler, true);
      cleanups.push(() => el.removeEventListener('paste', pasteHandler, true));
      // Block cut
      const cutHandler = (e: Event) => { e.preventDefault(); e.stopPropagation(); };
      el.addEventListener('cut', cutHandler, true);
      cleanups.push(() => el.removeEventListener('cut', cutHandler, true));
      // Block copy
      const copyHandler = (e: Event) => { e.preventDefault(); e.stopPropagation(); };
      el.addEventListener('copy', copyHandler, true);
      cleanups.push(() => el.removeEventListener('copy', copyHandler, true));
      // Block drag-drop
      const dragHandler = (e: Event) => { e.preventDefault(); e.stopPropagation(); };
      el.addEventListener('drop', dragHandler, true);
      el.addEventListener('dragover', dragHandler, true);
      cleanups.push(() => { el.removeEventListener('drop', dragHandler, true); el.removeEventListener('dragover', dragHandler, true); });
      // Block right-click context menu
      const contextHandler = (e: Event) => { e.preventDefault(); e.stopPropagation(); };
      el.addEventListener('contextmenu', contextHandler, true);
      cleanups.push(() => el.removeEventListener('contextmenu', contextHandler, true));
      // Block keyboard shortcuts: Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A
      const keyHandler = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      el.addEventListener('keydown', keyHandler, true);
      cleanups.push(() => el.removeEventListener('keydown', keyHandler, true));
      // Show contest-mode badge
      const badge = document.createElement('div');
      badge.id = 'contest-cheat-block';
      badge.textContent = 'Contest Mode — Copy/Paste disabled';
      Object.assign(badge.style, {
        position: 'absolute', top: '4px', right: '8px',
        background: 'rgba(239,68,68,0.9)', color: '#fff',
        fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
        fontFamily: 'monospace', zIndex: '10', pointerEvents: 'none',
      });
      el.appendChild(badge);
      cleanups.push(() => { const b = el.querySelector('#contest-cheat-block'); if (b) b.remove(); });
    }

    // Set default testcase input
    if (problem.testcases && problem.testcases.length > 0) {
      setCustomTestcaseInput(problem.testcases[0].input);
    }
    setHintText(null);
    setEvaluationResult(null);

    return () => {
      cmViewRef.current?.destroy();
      cmViewRef.current = null;
      cleanups.forEach((fn) => fn());
    };
  }, [problemId, language, problem]);

  // Auto-save to localStorage
  useEffect(() => {
    setIsSaving(true);
    const timeout = setTimeout(() => {
      localStorage.setItem(`leetcode_code_${problemId}_${language}`, userCode);
      setIsSaving(false);
    }, 600);
    return () => clearTimeout(timeout);
  }, [userCode, problemId, language]);

  // Sync external userCode changes (reset) into CodeMirror
  useEffect(() => {
    if (userCodeFromCmRef.current) {
      userCodeFromCmRef.current = false;
      return;
    }
    const view = cmViewRef.current;
    if (!view) return;
    const curDoc = view.state.doc.toString();
    if (curDoc !== userCode) {
      view.dispatch({
        changes: { from: 0, to: curDoc.length, insert: userCode },
      });
    }
  }, [userCode]);

  // Handle Vertical Dragging (left/right panels)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const nextPercent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
        if (nextPercent > 15 && nextPercent < 85) {
          setSplitPercent(nextPercent);
        }
      }
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle Horizontal Dragging (editor/terminal split)
  const handleTerminalMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = terminalHeight;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY;
      if (terminalContainerRef.current) {
        const parent = terminalContainerRef.current.parentElement;
        if (parent) {
          const maxHeight = parent.clientHeight - 48;
          const newHeight = Math.min(Math.max(startHeight + deltaY, 60), maxHeight);
          setTerminalHeight(newHeight);
        }
      }
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Reset current language snippet
  const handleResetSnippet = () => {
    const hasBoilerplate = problem.difficulty === 'Hard' && (problem.starterCode[language] || problem.starterCode['C++'] || '');
    if (window.confirm(hasBoilerplate ? 'Reset your code to the default boilerplate?' : 'Clear the editor?')) {
      const defaultSnippet = hasBoilerplate ? problem.starterCode[language] || problem.starterCode['C++'] || '' : '';
      setUserCode(defaultSnippet);
      localStorage.removeItem(`leetcode_code_${problemId}_${language}`);
    }
  };

  // Fetch hint
  const handleFetchHint = async () => {
    if (isLoadingHint) return;
    setIsLoadingHint(true);
    setHintText(null);

    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          code: userCode,
          language
        })
      });
      const data: HintResponse = await res.json();
      setHintText(data.hint);
    } catch (err) {
      console.error(err);
      setHintText('Hint: Check for character occurrences in your window boundaries!');
    } finally {
      setIsLoadingHint(false);
    }
  };

  // Fetch Editorial
  useEffect(() => {
    if (activeTab === 'Editorial' && !editorialData) {
      const fetchEditorial = async () => {
        setIsLoadingEditorial(true);
        try {
          const res = await fetch('/api/editorial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              problemId: problem.id,
              language
            })
          });
          const data: EditorialResponse = await res.json();
          setEditorialData(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoadingEditorial(false);
        }
      };
      fetchEditorial();
    }
  }, [activeTab, problemId, language, editorialData, problem]);

  // Code Execution (Run / Submit)
  const handleEvaluate = async (action: 'run' | 'submit') => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    setIsTerminalExpanded(true);
    setActiveConsoleTab('Test Result');
    setEvaluationResult(null);

    try {
      const isCustom = activeConsoleTab === 'Testcase' && customTestcaseInput.trim() !== '';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          language,
          code: userCode,
          action,
          customInput: isCustom ? customTestcaseInput : undefined,
          customExpected: isCustom ? customExpectedOutput : undefined
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text ? `Server error (${res.status})` : `HTTP ${res.status}`);
      }

      const result: EvaluationResult = await res.json();
      setEvaluationResult(result);

      if (action === 'submit' && result.status === 'Accepted') {
        onMarkSolved(problem.id);
      }

      // Save submission to DB + local tracker
      if (action === 'submit') {
        const subEntry = {
          timestamp: new Date().toLocaleTimeString(),
          status: result.status,
          runtime: result.runtime || '4ms',
          memory: result.memory || '10.2MB',
          language
        };
        setSubmissionHistory(prev => [subEntry, ...prev]);

        if (userId) {
          try {
            const subRes = await fetch('/api/submissions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                problemId: problem.id,
                language,
                code: userCode,
                status: result.status,
                runtime: result.runtime || '4ms',
                memory: result.memory || '10.2MB',
                testResults: result.testResults || null,
                userId,
              }),
            });
            if (!subRes.ok) {
              const subErr = await subRes.json().catch(() => ({ error: 'Unknown' }));
              console.error('Failed to save submission:', subErr);
            }
          } catch (err) {
            console.error('Failed to save submission:', err);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      const isTimeout = err?.name === 'AbortError';
      setEvaluationResult({
        status: isTimeout ? 'Time Limit Exceeded' : 'Runtime Error',
        compileError: isTimeout
          ? 'Execution timed out. Your code may contain an infinite loop or may be too slow.'
          : 'Server failed to respond. Please check your internet connection or developer API Key.',
        testResults: []
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes(prev => prev - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes(prev => prev + 1);
      setHasUpvoted(true);
      if (hasDownvoted) {
        setDownvotes(prev => prev - 1);
        setHasDownvoted(false);
      }
    }
  };

  const handleDownvote = () => {
    if (hasDownvoted) {
      setDownvotes(prev => prev - 1);
      setHasDownvoted(false);
    } else {
      setDownvotes(prev => prev + 1);
      setHasDownvoted(true);
      if (hasUpvoted) {
        setUpvotes(prev => prev - 1);
        setHasUpvoted(false);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-col flex-1 h-0 select-none bg-page overflow-hidden"
    >
      
      {/* Mini Workspace Header Bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2 text-xs font-sans">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-elevated text-secondary hover:text-primary transition-all font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Problem List</span>
          </button>
          <div className="h-4 w-px bg-elevated" />
          <span className="font-semibold text-primary tracking-tight truncate max-w-[200px] md:max-w-none">
            {problem.id}. {problem.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bookmark toggle button */}
          <button
            onClick={handleToggleBookmark}
            className={`flex items-center justify-center p-1.5 rounded hover:bg-elevated transition-all cursor-pointer ${
              isBookmarked ? 'text-yellow-500 hover:text-yellow-600' : 'text-text-muted hover:text-text-main'
            }`}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
          >
            <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-yellow-500' : ''}`} />
          </button>
          <div className="h-4 w-px bg-elevated" />
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
            JS / Python
          </span>
        </div>
      </div>

      {/* Workspace Split Body */}
      <div className="flex flex-1 h-0 w-full relative overflow-hidden">
        
        {/* Left Column: Problem Specification Workspace */}
        <div 
          className="h-full flex flex-col bg-panel relative border-r border-border"
          style={{ width: isIdeFullscreen ? '0%' : `${splitPercent}%`, display: isIdeFullscreen ? 'none' : 'flex' }}
        >
          {/* Flat Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 text-xs font-mono">
            <div className="flex items-center gap-4">
              {(['Description', 'Editorial', 'Solutions', 'Submissions'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 relative transition-colors ${
                    activeTab === tab ? 'text-primary font-medium' : 'text-muted hover:text-primary'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeWorkspaceTabBorder" 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Content Columns */}
          <div className="flex-1 overflow-y-auto p-5 font-sans relative flex flex-col gap-6" id="problem_specification">
            
            <AnimatePresence mode="wait">
              {activeTab === 'Description' && (
                <motion.div 
                  key="desc"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex flex-col gap-5 text-sm leading-relaxed"
                >
                  {/* Metadata Header */}
                  <div className="flex flex-col gap-3">
                    <h1 className="text-xl font-bold text-primary tracking-tight">
                      {problem.id}. {problem.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <span 
                        className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: 
                            problem.difficulty === 'Basic' || problem.difficulty === 'Easy' ? 'var(--color-easy-bg)' : 
                            problem.difficulty === 'Medium' ? 'var(--color-medium-bg)' : 'var(--color-hard-bg)',
                          color: 
                            problem.difficulty === 'Basic' || problem.difficulty === 'Easy' ? 'var(--color-easy)' : 
                            problem.difficulty === 'Medium' ? 'var(--color-medium)' : 'var(--color-hard)',
                          borderColor: 
                            problem.difficulty === 'Basic' || problem.difficulty === 'Easy' ? 'var(--color-easy-border)' : 
                            problem.difficulty === 'Medium' ? 'var(--color-medium-border)' : 'var(--color-hard-border)',
                        }}
                      >
                        {problem.difficulty}
                      </span>

                      {/* Topics dropdown */}
                      <div className="relative">
                        <button 
                          onClick={() => { setShowTopics(!showTopics); setShowCompanies(false); }}
                          className="flex items-center gap-1 text-[10px] bg-elevated hover:bg-hover transition-colors text-secondary hover:text-primary px-2.5 py-1 rounded"
                        >
                          <span>Topics</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        {showTopics && (
                          <div className="absolute top-7 left-0 bg-card border border-border-light rounded shadow-xl p-2.5 z-30 flex flex-wrap gap-1.5 w-52">
                            {problem.topics.map((t) => (
                              <span key={t} className="text-[10px] bg-elevated text-secondary px-2 py-0.5 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Companies dropdown */}
                      <div className="relative">
                        <button 
                          onClick={() => { setShowCompanies(!showCompanies); setShowTopics(false); }}
                          className="flex items-center gap-1 text-[10px] bg-elevated hover:bg-hover transition-colors text-secondary hover:text-primary px-2.5 py-1 rounded"
                        >
                          <span>Companies</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        {showCompanies && (
                          <div className="absolute top-7 left-0 bg-card border border-border-light rounded shadow-xl p-2.5 z-30 flex flex-col gap-1.5 w-48 font-mono text-[10px]">
                            {problem.companies.map((c) => (
                              <div key={c.name} className="flex justify-between items-center text-secondary">
                                <span>{c.name}</span>
                                <span className="text-emerald-400">Freq {c.frequency}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Hint Button */}
                      <button 
                        onClick={handleFetchHint}
                        disabled={isLoadingHint}
                        className="flex items-center gap-1 text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded border border-amber-500/10 transition-colors cursor-pointer"
                      >
                        <Lightbulb className="w-3 h-3" />
                        <span>{isLoadingHint ? 'Generating Hint...' : 'Hint'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Hint Panel */}
                  <AnimatePresence>
                    {hintText && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-xs text-amber-200">
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-amber-300">Code Analysis Hint</span>
                            <p className="leading-relaxed">{hintText}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {problem.description === "Problem details coming soon!" ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-elevated/40 border border-border-card rounded-2xl">
                      <AlertCircle className="w-12 h-12 text-[var(--color-amber)] mb-4 opacity-80" />
                      <h3 className="text-sm font-semibold text-text-main mb-2">Problem Details Coming Soon</h3>
                      <p className="text-xs text-text-muted max-w-xs leading-relaxed">
                        We are currently preparing the description, test cases, and community editorials for this problem. You can still write and edit code in the IDE panel!
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Description Markdown Render Box */}
                      <div className="text-xs text-text-main leading-relaxed flex flex-col gap-4">
                        {problem.description.split('\n\n').map((paragraph, i) => {
                          // Simple inline monospace parsing for prompt text `s` or indices
                          const processedText = paragraph.replace(/`([^`]+)`/g, '<code class="font-mono bg-elevated px-1.5 py-0.5 rounded text-primary text-[10px]">$1</code>');
                          return (
                            <p 
                              key={i} 
                              dangerouslySetInnerHTML={{ __html: processedText }}
                            />
                          );
                        })}
                      </div>

                      {/* Examples Execution Blocks */}
                      <div className="flex flex-col gap-4">
                        <p className="text-xs font-mono text-text-muted uppercase tracking-wider">Example Executions</p>
                        {problem.examples.map((ex, idx) => (
                          <div 
                            key={idx}
                            className="bg-elevated/35 border border-border-card rounded-xl p-4 flex flex-col gap-2 text-xs font-mono"
                          >
                            <p className="font-semibold text-primary">Example {idx + 1}:</p>
                            <div className="grid grid-cols-1 gap-1 text-text-main pl-2 border-l-2 border-border-card">
                              <div>
                                <span className="text-text-muted">Input:</span> {ex.input}
                              </div>
                              <div>
                                <span className="text-text-muted">Output:</span> {ex.output}
                              </div>
                              {ex.explanation && (
                                <div className="mt-1 leading-relaxed">
                                  <span className="text-text-muted">Explanation:</span> {ex.explanation}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                </motion.div>
              )}

              {activeTab === 'Editorial' && (
                <motion.div 
                  key="editorial"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex flex-col gap-5 text-sm"
                >
                  <h2 className="text-lg font-bold text-primary">Official Editorial Analysis</h2>
                  {isLoadingEditorial ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-xs text-secondary font-mono">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                      <span>Synthesizing optimal strategy from server...</span>
                    </div>
                  ) : editorialData ? (
                    <div className="flex flex-col gap-6 text-xs text-body leading-relaxed">
                      
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex flex-col gap-2">
                        <h3 className="font-semibold text-primary text-sm">Optimal Intuiton</h3>
                        <div className="text-xs leading-relaxed flex flex-col gap-3">
                          {editorialData.approach.split('\n\n').map((para, i) => (
                            <p key={i}>{para}</p>
                          ))}
                        </div>
                      </div>

                      <div className="border border-border rounded-xl p-4 bg-card/50 flex flex-col gap-2 font-mono">
                        <h3 className="font-semibold text-primary text-xs uppercase tracking-wider text-secondary">Complexity Bound</h3>
                        <p dangerouslySetInnerHTML={{ __html: editorialData.complexity.replace(/\$([^\$]+)\$/g, '<code class="text-emerald-400">$1</code>') }} />
                      </div>

                      <div className="flex flex-col gap-2">
                        <h3 className="font-semibold text-primary">Optimal Solution Code ({language})</h3>
                        <pre className="p-4 bg-surface border border-border rounded-xl overflow-x-auto text-green font-mono">
                          {editorialData.codeSolution}
                        </pre>
                      </div>

                    </div>
                  ) : (
                    <p className="text-xs text-muted font-mono">Failed to retrieve editorial strategists. Check server configurations.</p>
                  )}
                </motion.div>
              )}

              {activeTab === 'Solutions' && (
                <motion.div 
                  key="sol"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex flex-col gap-5 text-sm"
                >
                  <h2 className="text-lg font-bold text-primary">Community Solutions</h2>
                  
                  <div className="flex flex-col gap-4">
                    <div className="border border-border bg-card/50 p-4 rounded-xl flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary">🚀 Sliding Window [O(N)] - C++ Beats 98% Runtime</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">Optimal</span>
                      </div>
                      <p className="text-secondary leading-relaxed">
                        A highly clean one-pass scan tracking occurrences using an array map for maximum memory cache locality.
                      </p>
                      <div className="flex items-center gap-4 text-muted mt-2 font-mono text-[10px]">
                        <span>By code_wizard</span>
                        <span>👍 4,210 upvotes</span>
                        <span>💬 322 comments</span>
                      </div>
                    </div>

                    <div className="border border-border bg-card/50 p-4 rounded-xl flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary">🐍 Python3 Simple Sliding Window & Set [Detailed Comments]</span>
                        <span className="text-[10px] font-mono text-secondary bg-elevated px-1.5 py-0.2 rounded">Python</span>
                      </div>
                      <p className="text-secondary leading-relaxed">
                        Easy to understand Python loop keeping elements inside a standard set utility, shrinking left dynamically.
                      </p>
                      <div className="flex items-center gap-4 text-muted mt-2 font-mono text-[10px]">
                        <span>By py_compiler</span>
                        <span>👍 1,984 upvotes</span>
                        <span>💬 84 comments</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'Submissions' && (
                <motion.div 
                  key="sub"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex flex-col gap-4 text-sm font-mono"
                >
                  <h2 className="text-lg font-bold text-primary font-sans">Submission History</h2>

                  {submissionHistory.length === 0 ? (
                    <div className="py-12 text-center text-muted">
                      No submissions sent in this session yet.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {submissionHistory.map((sub, i) => (
                        <div 
                          key={i}
                          className="border border-border bg-card/40 p-4 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="flex flex-col gap-1">
                            <span 
                              className={`font-semibold text-sm ${sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-500'}`}
                            >
                              {sub.status}
                            </span>
                            <span className="text-muted text-[10px]">{sub.timestamp} • Language: {sub.language}</span>
                          </div>

                          <div className="flex items-center gap-4 text-[10px] text-secondary">
                            <div>
                              <span className="text-muted">Runtime:</span> {sub.runtime}
                            </div>
                            <div>
                              <span className="text-muted">Memory:</span> {sub.memory}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Footer Status Bar Left */}
          <div className="border-t border-border bg-surface px-4 py-3 flex items-center justify-between text-xs text-muted">
            <div className="flex items-center gap-4 font-mono">
              <button 
                onClick={handleUpvote}
                className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
                  hasUpvoted ? 'text-emerald-400 bg-emerald-500/10' : 'hover:text-primary hover:bg-elevated'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{upvotes}</span>
              </button>

              <button 
                onClick={handleDownvote}
                className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
                  hasDownvoted ? 'text-rose-500 bg-rose-500/10' : 'hover:text-primary hover:bg-elevated'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>{downvotes}</span>
              </button>

              <div className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>2.4K Comments</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[10px]">1,420 users active</span>
            </div>
          </div>

        </div>

        {/* 2. Resizable Vertical Divider handle */}
        <div 
          className="w-1.5 bg-card hover:bg-emerald-500/40 active:bg-emerald-500 cursor-col-resize transition-colors z-20 flex items-center justify-center"
          onMouseDown={handleMouseDown}
          style={{ display: isIdeFullscreen ? 'none' : 'flex' }}
        >
          <div className="w-px h-6 bg-hover" />
        </div>

        {/* Right Column: Code IDE & Sandbox Terminal */}
        <div 
          className="h-full flex flex-col bg-page"
          style={{ width: isIdeFullscreen ? '100%' : `${100 - splitPercent}%` }}
        >
          
          {/* IDE Workspace Header */}
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2 text-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-card border border-border-light focus:outline-none rounded text-xs text-primary px-3 py-1 pr-6 cursor-pointer appearance-none font-mono"
                  >
                    {['JavaScript', 'Python', 'C++', 'Java', 'Go'].map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
              </div>

              <span className="text-[10px] font-mono text-muted">
                {isSaving ? 'Saving...' : 'Auto Saved'}
              </span>
            </div>

            {/* Layout controls */}
            <div className="flex items-center gap-1 text-muted">
              <button 
                onClick={handleResetSnippet}
                title="Reset code template"
                className="hover:text-primary hover:bg-elevated p-1.5 rounded transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button 
                onClick={() => setIsIdeFullscreen(!isIdeFullscreen)}
                title={isIdeFullscreen ? "Exit Fullscreen" : "Fullscreen Code IDE"}
                className="hover:text-primary hover:bg-elevated p-1.5 rounded transition-colors cursor-pointer"
              >
                {isIdeFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-emerald-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button 
                title="Workspace settings"
                className="hover:text-primary hover:bg-elevated p-1.5 rounded transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CodeMirror Editor */}
          <div className="flex-1 overflow-auto relative" id="code_ide" style={{ minHeight: 0 }}>
            <div ref={editorContainerRef} className="absolute inset-0" />
          </div>

          {/* Horizontal drag handle between editor and terminal */}
          <div
            className="h-1.5 bg-card hover:bg-emerald-500/30 active:bg-emerald-500 cursor-row-resize transition-colors shrink-0 relative z-10"
            onMouseDown={handleTerminalMouseDown}
            style={{ display: isTerminalExpanded ? 'block' : 'none' }}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-px bg-hover" />
          </div>

          {/* Collapsible Execution Console Terminal */}
          <div
            ref={terminalContainerRef}
            className="border-t border-border bg-surface flex flex-col overflow-hidden shrink-0"
            style={{ height: isTerminalExpanded ? `${terminalHeight}px` : '40px' }}
          >
            {/* Headers for Console panel */}
            <div 
              onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
              className="flex items-center justify-between px-4 h-10 border-b border-border hover:bg-card transition-colors cursor-pointer select-none text-xs shrink-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-primary font-mono">
                  <Terminal className="w-4 h-4 text-secondary" />
                  <span>Terminal</span>
                </div>
                <div className="h-3 w-px bg-hover" />
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  {(['Testcase', 'Test Result'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveConsoleTab(tab);
                        setIsTerminalExpanded(true);
                      }}
                      className={`font-mono transition-colors py-1 ${
                        activeConsoleTab === tab ? 'text-primary font-semibold' : 'text-muted hover:text-primary'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {isTerminalExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-muted" />
                )}
              </div>
            </div>

            {/* Interactive Terminal Inner Content */}
            {isTerminalExpanded && (
              <div className="flex-1 p-4 overflow-y-auto bg-term text-xs font-mono min-h-0">
                {activeConsoleTab === 'Testcase' ? (
                  <div className="flex flex-col gap-3">
                    <span className="text-muted">Enter testcase parameters:</span>
                    <textarea
                      value={customTestcaseInput}
                      onChange={(e) => setCustomTestcaseInput(e.target.value)}
                      placeholder={`[2,7,11,15]\n9`}
                      spellCheck={false}
                      className="w-full h-24 bg-card border border-border-light focus:border-hover focus:outline-none rounded-lg p-3 text-emerald-400 placeholder-line-text"
                    />
                    <span className="text-[10px] text-muted">
                      Each line is one function argument in JSON format.
                    </span>
                    <span className="text-muted">Expected output:</span>
                    <textarea
                      value={customExpectedOutput}
                      onChange={(e) => setCustomExpectedOutput(e.target.value)}
                      placeholder={`[0,1]`}
                      spellCheck={false}
                      className="w-full h-12 bg-card border border-border-light focus:border-hover focus:outline-none rounded-lg p-3 text-emerald-400 placeholder-line-text"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {isEvaluating ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3 text-secondary">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                        <span>Compiling code snippet & grading results...</span>
                      </div>
                    ) : evaluationResult ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-muted">Status:</span>
                            <span 
                              className={`text-sm font-bold uppercase tracking-wider ${
                                evaluationResult.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-500'
                              }`}
                            >
                              {evaluationResult.status}
                            </span>
                          </div>

                          {evaluationResult.status === 'Accepted' && (
                            <div className="flex items-center gap-3 text-secondary text-[10px]">
                              <span>Runtime: <strong className="text-emerald-400 font-mono">{evaluationResult.runtime}</strong></span>
                              <span>Memory: <strong className="text-emerald-400 font-mono">{evaluationResult.memory}</strong></span>
                            </div>
                          )}
                        </div>

                        {/* Compiler error outputs */}
                        {evaluationResult.compileError && (
                          <div className="bg-rose-950/20 border border-rose-900/30 p-3.5 rounded-lg text-rose-300 overflow-x-auto text-[11px] leading-relaxed">
                            <div className="flex items-center gap-2 mb-1 text-rose-400 font-bold">
                              <AlertCircle className="w-4 h-4" />
                              <span>Traceback Compilation Error:</span>
                            </div>
                            <pre>{evaluationResult.compileError}</pre>
                          </div>
                        )}

                        {/* Testcases Outputs */}
                        {evaluationResult.testResults && evaluationResult.testResults.length > 0 && (
                          <div className="flex flex-col gap-3">
                            {evaluationResult.testResults.map((tr, index) => (
                              <div 
                                key={index} 
                                className={`border rounded-lg p-3 ${
                                  tr.passed ? 'border-border bg-card/30' : 'border-rose-900/20 bg-rose-950/5'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-xs text-secondary">Testcase {index + 1}:</span>
                                  <span className={`text-[10px] font-bold ${tr.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {tr.passed ? '✓ PASSED' : '✗ FAILED'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                                  <div className="bg-card p-2 rounded">
                                    <span className="text-muted block text-[9px] mb-0.5 uppercase font-mono">Input:</span>
                                    <span className="text-body">{tr.input}</span>
                                  </div>
                                  <div className="bg-card p-2 rounded">
                                    <span className="text-muted block text-[9px] mb-0.5 uppercase font-mono">Expected:</span>
                                    <span className="text-emerald-400">{tr.expected}</span>
                                  </div>
                                  <div className="bg-card p-2 rounded">
                                    <span className="text-muted block text-[9px] mb-0.5 uppercase font-mono">Actual:</span>
                                    <span className={tr.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{tr.actual}</span>
                                  </div>
                                </div>

                                {tr.stdout && (
                                  <div className="mt-2 text-[10px] text-muted border-t border-border pt-1 font-mono">
                                    <span className="text-muted block">stdout:</span>
                                    {tr.stdout}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted">
                        Compile and run your code using "Run" or "Submit".
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Footer Action Toolbar */}
            <div className="border-t border-border bg-surface px-4 py-2 flex items-center justify-between text-xs h-12">
              <button 
                onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
                className="flex items-center gap-1.5 text-secondary hover:text-primary transition-colors"
              >
                <span>Console</span>
                {isTerminalExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEvaluate('run')}
                  disabled={isEvaluating}
                  className="flex items-center gap-1.5 bg-elevated hover:bg-hover active:bg-card transition-colors text-primary px-4 py-2 rounded-lg font-mono font-semibold cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-primary" />
                  <span>Run</span>
                </button>

                <button 
                  onClick={() => handleEvaluate('submit')}
                  disabled={isEvaluating}
                  className="bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 transition-colors text-black px-5 py-2 rounded-lg font-mono font-bold cursor-pointer flex items-center gap-1 disabled:opacity-50"
                >
                  {isEvaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                  <span>Submit</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
