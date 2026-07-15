'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Trophy, Search, X, Loader2,
  ExternalLink, Clock, AlertTriangle
} from 'lucide-react'

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

type ContestStatus = 'draft' | 'published' | 'ended'

function getContestStatus(c: Contest): ContestStatus {
  if (!c.isPublished) return 'draft'
  if (c.endsAt && new Date(c.endsAt) < new Date()) return 'ended'
  return 'published'
}

const StatusBadge = ({ status }: { status: ContestStatus }) => {
  const map: Record<ContestStatus, { label: string; cls: string }> = {
    draft: { label: 'Draft', cls: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    published: { label: 'Published', cls: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    ended: { label: 'Ended', cls: 'text-gray-500 bg-gray-500/10 border-gray-500/20' },
  }
  const { label, cls } = map[status]
  return <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${cls}`}>{label}</span>
}

export default function AdminContestsPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [problems, setProblems] = useState<Problem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const adminHeaders = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    'x-admin-email': localStorage.getItem('codenode_user_email') || '',
  })
  const [violations, setViolations] = useState<Array<{ id: string; type: string; userId: string; createdAt: string; user?: { name: string; email: string } }>>([])
  const [showViolations, setShowViolations] = useState<string | null>(null)
  const [loadingViolations, setLoadingViolations] = useState(false)
  const [probSearch, setProbSearch] = useState('')
  const [diffFilter, setDiffFilter] = useState('')
  const [showProbPicker, setShowProbPicker] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    durationMins: 60,
    maxPoints: 100,
    maxViolations: 3,
    startsAt: '',
    endsAt: '',
    selectedProblems: [] as string[],
  })

  const loadContests = useCallback(async () => {
    const res = await fetch('/api/contests?admin=true', {
      headers: { 'x-admin-email': localStorage.getItem('codenode_user_email') || '' },
    })
    if (res.ok) setContests(await res.json())
  }, [])

  const loadProblems = useCallback(async () => {
    const res = await fetch('/api/admin/problems', {
      headers: { 'x-admin-email': localStorage.getItem('codenode_user_email') || '' },
    })
    if (res.ok) setProblems(await res.json())
  }, [])

  useEffect(() => {
    Promise.all([loadContests(), loadProblems()]).finally(() => setLoading(false))
    const pid = localStorage.getItem('codenode_profile_id')
    if (pid) setProfileId(pid)
    const email = localStorage.getItem('codenode_user_email') || ''
    if (pid && email) {
      fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pid, email }),
      }).catch(() => {})
    }
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
    setForm({ title: '', description: '', durationMins: 60, maxPoints: 100, maxViolations: 3, startsAt: '', endsAt: '', selectedProblems: [] })
    setEditingId(null)
    setShowForm(false)
    setShowProbPicker(false)
  }

  const toLocalDatetime = (iso: string): string => {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${h}:${min}`;
  };

  const handleEdit = (contest: Contest) => {
    setForm({
      title: contest.title,
      description: contest.description || '',
      durationMins: contest.durationMins,
      maxPoints: contest.maxPoints,
      maxViolations: (contest as any).maxViolations ?? 3,
      startsAt: contest.startsAt ? toLocalDatetime(contest.startsAt) : '',
      endsAt: contest.endsAt ? toLocalDatetime(contest.endsAt) : '',
      selectedProblems: contest.problems.map((cp) => cp.problem.id),
    })
    setEditingId(contest.id)
    setShowForm(true)
  }

  const toUtcIso = (localValue: string): string | undefined => {
    if (!localValue) return undefined
    return new Date(localValue).toISOString()
  }

  const handleSave = async () => {
    if (!profileId) { alert('Please sync your profile first (visit any page)'); return }
    const body = {
      title: form.title,
      description: form.description || undefined,
      durationMins: form.durationMins,
      maxPoints: form.maxPoints,
      maxViolations: form.maxViolations,
      startsAt: toUtcIso(form.startsAt),
      endsAt: toUtcIso(form.endsAt),
      problemIds: form.selectedProblems,
      createdBy: profileId,
    }
    const url = editingId ? `/api/contests/${editingId}` : '/api/contests'
    const method = editingId ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: adminHeaders(), body: JSON.stringify(body) })
    if (res.ok) { resetForm(); loadContests() }
    else { const err = await res.json().catch(() => ({ error: 'Request failed' })); alert(err.error || 'Failed to save') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contest? This action cannot be undone.')) return
    const res = await fetch(`/api/contests/${id}`, { method: 'DELETE', headers: adminHeaders() })
    if (res.ok) loadContests()
    else { const err = await res.json().catch(() => ({ error: 'Delete failed' })); alert(err.error) }
  }

  const handleTogglePublish = async (id: string) => {
    const res = await fetch(`/api/contests/${id}/publish`, { method: 'POST', headers: adminHeaders() })
    if (res.ok) loadContests()
    else { const err = await res.json().catch(() => ({ error: 'Publish failed' })); alert(err.error) }
  }

  const loadViolations = async (contestId: string) => {
    setLoadingViolations(true)
    setShowViolations(contestId)
    const res = await fetch(`/api/contests/${contestId}/violations`, {
      headers: { 'x-admin-email': localStorage.getItem('codenode_user_email') || '' },
    })
    if (res.ok) {
      const data = await res.json()
      const userIds = [...new Set(data.map((v: any) => v.userId))] as string[]
      const userMap: Record<string, { name: string; email: string }> = {}
      await Promise.all(userIds.map(async (uid) => {
        const userRes = await fetch(`/api/profile/${uid}`)
        if (userRes.ok) {
          const profile = await userRes.json()
          userMap[uid] = { name: profile.name || 'Unknown', email: profile.email || '' }
        }
      }))
      setViolations(data.map((v: any) => ({ ...v, user: userMap[v.userId] })))
    }
    setLoadingViolations(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#f5f5f5]">Contest Manager</h1>
          <p className="text-xs text-[#888] mt-1">
            {contests.length} contest{contests.length !== 1 ? 's' : ''} — published contests appear in Test Arena
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> New Contest
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-[#f5f5f5]">{editingId ? 'Edit Contest' : 'Create Contest'}</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-[10px] font-mono font-bold text-[#888] uppercase">Title</label>
              <input className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-3 py-2 text-xs text-[#f5f5f5] outline-none focus:border-emerald-500/50"
                value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-[10px] font-mono font-bold text-[#888] uppercase">Description</label>
              <textarea className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-3 py-2 text-xs text-[#f5f5f5] outline-none focus:border-emerald-500/50 resize-none h-16"
                value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-[#888] uppercase">Duration (mins)</label>
              <input type="number" min={1} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-3 py-2 text-xs text-[#f5f5f5] outline-none focus:border-emerald-500/50"
                value={form.durationMins} onChange={(e) => setForm((p) => ({ ...p, durationMins: +e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-[#888] uppercase">Max Points</label>
              <input type="number" min={0} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-3 py-2 text-xs text-[#f5f5f5] outline-none focus:border-emerald-500/50"
                value={form.maxPoints} onChange={(e) => setForm((p) => ({ ...p, maxPoints: +e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-[#888] uppercase">Max Violations</label>
              <input type="number" min={1} max={20} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-3 py-2 text-xs text-[#f5f5f5] outline-none focus:border-emerald-500/50"
                value={form.maxViolations} onChange={(e) => setForm((p) => ({ ...p, maxViolations: +e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-[#888] uppercase">Starts At</label>
              <input type="datetime-local" placeholder="YYYY-MM-DD HH:MM" style={{ colorScheme: 'dark' }} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-3 py-2 text-xs text-[#f5f5f5] outline-none focus:border-emerald-500/50 [color-scheme:dark]"
                value={form.startsAt} onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-[#888] uppercase">Ends At</label>
              <input type="datetime-local" placeholder="YYYY-MM-DD HH:MM" style={{ colorScheme: 'dark' }} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-3 py-2 text-xs text-[#f5f5f5] outline-none focus:border-emerald-500/50 [color-scheme:dark]"
                value={form.endsAt} onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))} />
            </div>
          </div>

          {/* Problem Picker */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono font-bold text-[#888] uppercase">Problems ({form.selectedProblems.length} selected)</label>

            {selectedProblemData.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedProblemData.map((p) => (
                  <span key={p.id} className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold px-2 py-0.5 rounded-full">
                    #{p.leetcodeId}
                    <button onClick={() => toggleProblem(p.id)} className="hover:text-rose-500"><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2 mb-1">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#666]" />
                <input placeholder="Search problems..." className="w-full bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg pl-7 pr-2 py-1.5 text-[10px] text-[#f5f5f5] outline-none focus:border-emerald-500/50"
                  value={probSearch} onChange={(e) => setProbSearch(e.target.value)} />
              </div>
              <select className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-2 py-1.5 text-[10px] text-[#f5f5f5] outline-none focus:border-emerald-500/50"
                value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)}>
                <option value="">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="max-h-40 overflow-y-auto border border-[#1e1e1e] rounded-lg p-2 space-y-0.5 bg-[#0a0a0a]">
              {filteredProblems.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-[10px] cursor-pointer hover:bg-[#1a1a1a] rounded px-1.5 py-1 transition-colors">
                  <input type="checkbox" checked={form.selectedProblems.includes(p.id)} onChange={() => toggleProblem(p.id)} className="accent-emerald-500" />
                  <span className={`font-semibold ${p.difficulty === 'Easy' ? 'text-emerald-500' : p.difficulty === 'Medium' ? 'text-amber-500' : 'text-red-500'}`}>
                    {p.leetcodeId}. {p.title}
                  </span>
                  <span className={`ml-auto text-[8px] font-mono font-bold px-1 py-0.5 rounded border ${
                    p.difficulty === 'Easy' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 
                    p.difficulty === 'Medium' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : 
                    'text-red-500 border-red-500/20 bg-red-500/5'
                  }`}>{p.difficulty}</span>
                </label>
              ))}
              {filteredProblems.length === 0 && <p className="text-[10px] text-[#666] text-center py-2">No problems match</p>}
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <button onClick={resetForm}
              className="text-xs font-bold px-3 py-2 rounded-lg border border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] transition-colors">Cancel</button>
            <button onClick={handleSave}
              className="bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold px-3 py-2 rounded-lg transition-colors">
              {editingId ? 'Update Contest' : 'Create Contest'}
            </button>
          </div>
        </div>
      )}

      {/* Violations Modal */}
      {showViolations && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowViolations(null)}>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#f5f5f5] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" /> Violations
              </h3>
              <button onClick={() => setShowViolations(null)} className="text-[#888] hover:text-[#f5f5f5]"><X className="w-4 h-4" /></button>
            </div>
            {loadingViolations ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-emerald-500 animate-spin" /></div>
            ) : violations.length === 0 ? (
              <p className="text-xs text-[#666] text-center py-6">No violations recorded for this contest.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {violations.map((v) => (
                  <div key={v.id} className="flex items-center justify-between bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-3 py-2 text-[10px] font-mono">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[#f5f5f5] font-bold capitalize">{v.type.replace(/_/g, ' ')}</span>
                      {v.user && <span className="text-[#888]">{v.user.name} ({v.user.email})</span>}
                    </div>
                    <span className="text-[#666]">{new Date(v.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contests Table */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        {contests.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[#666]">No contests yet. Create your first contest to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e1e1e] text-[10px] font-mono font-bold text-[#666] uppercase tracking-wider">
                  <th className="py-3 px-4">Contest</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Problems</th>
                  <th className="py-3 px-4">Starts</th>
                  <th className="py-3 px-4">Ends</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]/60">
                {contests.map((contest) => {
                  const status = getContestStatus(contest)
                  return (
                    <tr key={contest.id} className="hover:bg-[#1a1a1a] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#f5f5f5]">{contest.title}</span>
                          {contest.description && (
                            <span className="text-[10px] text-[#666] truncate max-w-[200px]">{contest.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={status} /></td>
                      <td className="py-3 px-4 font-mono text-[#aaa]">{contest.durationMins} min</td>
                      <td className="py-3 px-4 font-mono text-[#aaa]">{contest.problems.length}</td>
                      <td className="py-3 px-4 text-[#666] font-mono text-[10px]">
                        {contest.startsAt ? new Date(contest.startsAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-[#666] font-mono text-[10px]">
                        {contest.endsAt ? new Date(contest.endsAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <a href={`/test-arena`} target="_blank"
                            className="p-1.5 rounded border border-[#2a2a2a] text-[#888] hover:text-[#f5f5f5] hover:bg-[#1a1a1a] transition-all"
                            title="View in Test Arena">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          {/* Violations */}
                          <button onClick={() => loadViolations(contest.id)}
                            className="p-1.5 rounded border border-[#2a2a2a] text-[#888] hover:text-red-500 hover:bg-[#1a1a1a] transition-all"
                            title="View Violations">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                          {/* Leaderboard */}
                          <a href={`/api/contests/${contest.id}/leaderboard`} target="_blank"
                            className="p-1.5 rounded border border-[#2a2a2a] text-[#888] hover:text-amber-500 hover:bg-[#1a1a1a] transition-all"
                            title="Leaderboard">
                            <Trophy className="w-3.5 h-3.5" />
                          </a>
                          {/* Publish / Unpublish */}
                          {status !== 'ended' && (
                            <button onClick={() => handleTogglePublish(contest.id)}
                              className="p-1.5 rounded border border-[#2a2a2a] hover:bg-[#1a1a1a] transition-all"
                              title={contest.isPublished ? 'Unpublish' : 'Publish'}>
                              {contest.isPublished
                                ? <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                                : <Eye className="w-3.5 h-3.5 text-emerald-500" />
                              }
                            </button>
                          )}
                          {/* Edit */}
                          <button onClick={() => handleEdit(contest)}
                            className="p-1.5 rounded border border-[#2a2a2a] text-[#888] hover:text-blue-500 hover:bg-[#1a1a1a] transition-all"
                            title="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {/* Delete */}
                          <button onClick={() => handleDelete(contest.id)}
                            className="p-1.5 rounded border border-[#2a2a2a] text-[#888] hover:text-red-500 hover:bg-red-500/5 transition-all"
                            title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
