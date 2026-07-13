'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import AppLayout from '@/src/components/AppLayout'
import Card from '@/src/components/ui/Card'
import Badge from '@/src/components/ui/Badge'
import { Plus, Edit2, Trash2, Eye, EyeOff, Trophy, Search, X, Loader2 } from 'lucide-react'
import { supabase } from '@/src/utils/supabaseClient'

interface Problem {
  id: string
  leetcodeId: number
  title: string
  difficulty: string
}

interface ContestProblem {
  id: string
  problem: Problem
  sortOrder: number
  points: number
}

interface Contest {
  id: string
  title: string
  description: string | null
  durationMins: number
  maxPoints: number
  startsAt: string | null
  endsAt: string | null
  isPublished: boolean
  createdBy: string
  problems: ContestProblem[]
}

export default function AdminContestsPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [problems, setProblems] = useState<Problem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [probSearch, setProbSearch] = useState('')
  const [diffFilter, setDiffFilter] = useState('')
  const [showProbPicker, setShowProbPicker] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    durationMins: 60,
    maxPoints: 100,
    startsAt: '',
    endsAt: '',
    selectedProblems: [] as string[],
  })

  const loadContests = useCallback(async () => {
    const res = await fetch('/api/contests')
    if (res.ok) setContests(await res.json())
  }, [])

  const loadProblems = useCallback(async () => {
    const res = await fetch('/api/problems')
    if (res.ok) {
      const data = await res.json()
      setProblems(data)
    }
  }, [])

  useEffect(() => {
    loadContests()
    loadProblems()
    const stored = localStorage.getItem('codenode_profile_id')
    if (stored) setProfileId(stored)

    ;(async () => {
      let email = localStorage.getItem('codenode_user_email') || ''

      if (!email) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email) {
          email = session.user.email
          localStorage.setItem('codenode_user_email', email)
          if (session.user.id) {
            setProfileId(session.user.id)
            localStorage.setItem('codenode_profile_id', session.user.id)
          }
        }
      }

      setUserEmail(email)
      setIsAdmin(email.endsWith('gmail.com') || email === 'deepika.tiwari.1408@gmail.com')
      setAuthLoading(false)
    })()
  }, [loadContests, loadProblems])

  const filteredProblems = useMemo(() => {
    let list = problems
    if (probSearch) {
      const q = probSearch.toLowerCase()
      list = list.filter((p) => p.title.toLowerCase().includes(q) || String(p.leetcodeId).includes(q))
    }
    if (diffFilter) list = list.filter((p) => p.difficulty === diffFilter)
    return list
  }, [problems, probSearch, diffFilter])

  const resetForm = () => {
    setForm({ title: '', description: '', durationMins: 60, maxPoints: 100, startsAt: '', endsAt: '', selectedProblems: [] })
    setEditingId(null)
    setShowForm(false)
    setShowProbPicker(false)
  }

  const handleEdit = (contest: Contest) => {
    setForm({
      title: contest.title,
      description: contest.description || '',
      durationMins: contest.durationMins,
      maxPoints: contest.maxPoints,
      startsAt: contest.startsAt ? new Date(contest.startsAt).toISOString().slice(0, 16) : '',
      endsAt: contest.endsAt ? new Date(contest.endsAt).toISOString().slice(0, 16) : '',
      selectedProblems: contest.problems.map((cp) => cp.problem.id),
    })
    setEditingId(contest.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!profileId) { alert('Please sync your profile first (visit any page)'); return }
    const body = {
      title: form.title,
      description: form.description || undefined,
      durationMins: form.durationMins,
      maxPoints: form.maxPoints,
      startsAt: form.startsAt || undefined,
      endsAt: form.endsAt || undefined,
      problemIds: form.selectedProblems,
      createdBy: profileId,
    }
    const url = editingId ? `/api/contests/${editingId}` : '/api/contests'
    const method = editingId ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { resetForm(); loadContests() }
    else { const err = await res.json(); alert(err.error || 'Failed to save') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contest?')) return
    const res = await fetch(`/api/contests/${id}`, { method: 'DELETE' })
    if (res.ok) loadContests()
  }

  const handleTogglePublish = async (id: string) => {
    const res = await fetch(`/api/contests/${id}/publish`, { method: 'POST' })
    if (res.ok) loadContests()
  }

  const toggleProblem = (id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedProblems: prev.selectedProblems.includes(id)
        ? prev.selectedProblems.filter((p) => p !== id)
        : [...prev.selectedProblems, id],
    }))
  }

  const selectedProblemData = form.selectedProblems
    .map((id) => problems.find((p) => p.id === id))
    .filter(Boolean) as Problem[]

  if (authLoading) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto mt-20 text-center">
          <Card className="p-8 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-xs text-text-muted">Checking authentication...</p>
          </Card>
        </div>
      </AppLayout>
    )
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto mt-20 text-center">
          <Card className="p-8 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <EyeOff className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-sm font-bold text-text-main">Access Restricted</h2>
            <p className="text-xs text-text-muted">Only admins can manage contests. Sign in with an admin account (deepika.tiwari.1408@gmail.com).</p>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto flex flex-col gap-4 font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-text-main">Contest Manager</h1>
            <p className="text-xs text-text-muted">Create and manage coding contests — published contests appear in Test Arena and Dashboard</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true) }}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Contest
          </button>
        </div>

        {showForm && (
          <Card className="flex flex-col gap-3 p-4">
            <h2 className="text-sm font-bold text-text-main">{editingId ? 'Edit Contest' : 'Create Contest'}</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[10px] font-mono font-bold text-text-muted uppercase">Title</label>
                <input className="bg-bg-base border border-border-card rounded-lg px-3 py-2 text-xs text-text-main outline-none focus:border-primary"
                  value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[10px] font-mono font-bold text-text-muted uppercase">Description</label>
                <textarea className="bg-bg-base border border-border-card rounded-lg px-3 py-2 text-xs text-text-main outline-none focus:border-primary resize-none h-16"
                  value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-text-muted uppercase">Duration (mins)</label>
                <input type="number" min={1} className="bg-bg-base border border-border-card rounded-lg px-3 py-2 text-xs text-text-main outline-none focus:border-primary"
                  value={form.durationMins} onChange={(e) => setForm((p) => ({ ...p, durationMins: +e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-text-muted uppercase">Max Points</label>
                <input type="number" min={0} className="bg-bg-base border border-border-card rounded-lg px-3 py-2 text-xs text-text-main outline-none focus:border-primary"
                  value={form.maxPoints} onChange={(e) => setForm((p) => ({ ...p, maxPoints: +e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-text-muted uppercase">Starts At</label>
                <input type="datetime-local" className="bg-bg-base border border-border-card rounded-lg px-3 py-2 text-xs text-text-main outline-none focus:border-primary"
                  value={form.startsAt} onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-text-muted uppercase">Ends At</label>
                <input type="datetime-local" className="bg-bg-base border border-border-card rounded-lg px-3 py-2 text-xs text-text-main outline-none focus:border-primary"
                  value={form.endsAt} onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))} />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-text-muted uppercase">Problems ({form.selectedProblems.length} selected)</label>

              {selectedProblemData.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedProblemData.map((p) => (
                    <span key={p.id} className="flex items-center gap-1 bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full">
                      #{p.leetcodeId}
                      <button onClick={() => toggleProblem(p.id)} className="hover:text-rose-500"><X className="w-2.5 h-2.5" /></button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mb-1">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
                  <input placeholder="Search problems..." className="w-full bg-bg-base border border-border-card rounded-lg pl-7 pr-2 py-1.5 text-[10px] text-text-main outline-none focus:border-primary"
                    value={probSearch} onChange={(e) => setProbSearch(e.target.value)} />
                </div>
                <select className="bg-bg-base border border-border-card rounded-lg px-2 py-1.5 text-[10px] text-text-main outline-none focus:border-primary"
                  value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)}>
                  <option value="">All</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="max-h-40 overflow-y-auto border border-border-card rounded-lg p-2 space-y-0.5">
                {filteredProblems.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-[10px] cursor-pointer hover:bg-hover rounded px-1.5 py-1 transition-colors">
                    <input type="checkbox" checked={form.selectedProblems.includes(p.id)} onChange={() => toggleProblem(p.id)} className="accent-primary" />
                    <span className={`font-semibold ${p.difficulty === 'Easy' ? 'text-easy' : p.difficulty === 'Medium' ? 'text-medium' : 'text-hard'}`}>
                      {p.leetcodeId}. {p.title}
                    </span>
                    <span className={`ml-auto text-[8px] font-mono font-bold px-1 py-0.5 rounded ${
                      p.difficulty === 'Easy' ? 'bg-easy-bg text-easy' : p.difficulty === 'Medium' ? 'bg-medium-bg text-medium' : 'bg-hard-bg text-hard'
                    }`}>{p.difficulty}</span>
                  </label>
                ))}
                {filteredProblems.length === 0 && <p className="text-[10px] text-text-muted text-center py-2">No problems match your search</p>}
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <button onClick={resetForm}
                className="text-xs font-bold px-3 py-2 rounded-lg border border-border-card text-text-muted hover:bg-hover transition-colors">Cancel</button>
              <button onClick={handleSave}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                {editingId ? 'Update Contest' : 'Create Contest'}
              </button>
            </div>
          </Card>
        )}

        <div className="flex flex-col gap-2">
          {contests.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-xs text-text-muted">No contests yet. Create your first contest to get started.</p>
            </Card>
          )}
          {contests.map((contest) => (
            <Card key={contest.id} className="flex items-center justify-between gap-3 p-3">
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-text-main truncate">{contest.title}</h3>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${contest.isPublished ? 'bg-primary/10 text-primary' : 'bg-hover text-text-muted'}`}>
                    {contest.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                {contest.description && <p className="text-[10px] text-text-muted truncate">{contest.description}</p>}
                <div className="flex gap-3 text-[9px] font-mono text-text-muted font-bold mt-0.5">
                  <span>{contest.durationMins} mins</span>
                  <span>{contest.maxPoints} pts</span>
                  <span>{contest.problems.length} problems</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a href={`/api/contests/${contest.id}/leaderboard`} target="_blank"
                  className="text-[10px] font-bold px-2 py-1.5 rounded-lg border border-border-card text-text-muted hover:bg-hover transition-colors flex items-center gap-1"
                  title="Leaderboard">
                  <Trophy className="w-3 h-3" />
                </a>
                <button onClick={() => handleTogglePublish(contest.id)}
                  className="text-[10px] font-bold px-2 py-1.5 rounded-lg border border-border-card text-text-muted hover:bg-hover transition-colors"
                  title={contest.isPublished ? 'Unpublish' : 'Publish'}>
                  {contest.isPublished ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                <button onClick={() => handleEdit(contest)}
                  className="text-[10px] font-bold px-2 py-1.5 rounded-lg border border-border-card text-text-muted hover:bg-hover transition-colors">
                  <Edit2 className="w-3 h-3" />
                </button>
                <button onClick={() => handleDelete(contest.id)}
                  className="text-[10px] font-bold px-2 py-1.5 rounded-lg border border-border-card text-rose-500 hover:bg-rose-500/10 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
