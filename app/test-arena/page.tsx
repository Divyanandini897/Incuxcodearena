'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/src/components/AppLayout'
import { Terminal, Clock, Award, Play } from 'lucide-react'
import Card from '@/src/components/ui/Card'
import Button from '@/src/components/ui/Button'
import Badge from '@/src/components/ui/Badge'

interface TestData {
  id: string
  title: string
  description: string
  durationMins: number
  maxPoints: number
  maxViolations?: number
  questions: Array<{ id: number; title: string; points: number }>
  startsAt: string | null
  endsAt: string | null
  isUpcoming?: boolean
  isEnded?: boolean
  scheduledDate?: string
}

export default function TestArenaPage() {
  const router = useRouter()
  const [contests, setContests] = useState<TestData[]>([])
  const [loading, setLoading] = useState(true)
  const [registered, setRegistered] = useState<Set<string>>(new Set())
  const profileId = typeof window !== 'undefined' ? localStorage.getItem('codenode_profile_id') : null

  const loadContests = useCallback(async () => {
    try {
      const res = await fetch('/api/contests')
      if (res.ok) {
        const data = await res.json()
        const published = data.filter((c: { isPublished: boolean }) => c.isPublished)
        const mapped: TestData[] = published.map((c: {
          id: string; title: string; description: string | null;
          durationMins: number; maxPoints: number; startsAt: string | null; endsAt: string | null;
          problems: Array<{ problem: { leetcodeId: number; title: string }; points: number }>
        }) => {
          const startsAt = c.startsAt || null
          const endsAt = c.endsAt || null
          const now = new Date()
          const startDate = startsAt ? new Date(startsAt) : null
          const endDate = endsAt ? new Date(endsAt) : null
          let isUpcoming = false, isEnded = false
          if (startDate && now < startDate) isUpcoming = true
          else if (endDate && now > endDate) isEnded = true
          return {
            id: c.id, title: c.title, description: c.description || '',
            durationMins: c.durationMins, maxPoints: c.maxPoints,
            startsAt, endsAt, isUpcoming, isEnded,
            scheduledDate: startDate ? startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
            questions: c.problems.map((cp) => ({
              id: cp.problem.leetcodeId, title: cp.problem.title,
              points: cp.points || Math.round(c.maxPoints / c.problems.length),
            })),
          }
        })
        setContests(mapped)
      }
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadContests() }, [loadContests])

  // Refresh phase every 15s
  useEffect(() => {
    const interval = setInterval(() => {
      setContests((prev) => prev.map((c) => {
        const now = new Date()
        const startDate = c.startsAt ? new Date(c.startsAt) : null
        const endDate = c.endsAt ? new Date(c.endsAt) : null
        return {
          ...c,
          isUpcoming: startDate ? now < startDate : false,
          isEnded: endDate ? now > endDate : false,
        }
      }))
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleRegister = async (contestId: string, register: boolean) => {
    if (!profileId) return
    try {
      if (register) {
        await fetch(`/api/contests/${contestId}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: profileId }),
        })
        setRegistered((prev) => new Set(prev).add(contestId))
      } else {
        await fetch(`/api/contests/${contestId}/register`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: profileId }),
        })
        setRegistered((prev) => { const next = new Set(prev); next.delete(contestId); return next })
      }
    } catch { /* ignore */ }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto flex flex-col gap-6 font-sans">
        <Card className="flex flex-col gap-2 relative overflow-hidden select-none">
          <span className="text-[10px] font-mono font-bold uppercase text-primary tracking-wider">Evaluation Hub</span>
          <h1 className="text-lg font-bold tracking-tight text-text-main">Student Test Arena</h1>
          <p className="text-xs text-text-muted leading-relaxed font-semibold">
            Prepare for technical coding assessments. Complete active tests, solve target problems, and verify your analytical score dynamically.
          </p>
        </Card>

        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main border-b border-border-card/50 pb-2">
            Active Assessments
          </h2>
          {loading && <p className="text-xs text-text-muted">Loading contests...</p>}
          {!loading && contests.length === 0 && (
            <Card className="p-4 text-center">
              <p className="text-xs text-text-muted">No published contests available yet.</p>
            </Card>
          )}
          {contests.map((test) => (
            <Card key={test.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col gap-1.5 min-w-0">
                <h3 className="text-sm font-bold text-text-main leading-snug truncate">{test.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed font-semibold line-clamp-2">{test.description}</p>
                <div className="flex flex-wrap gap-4 mt-2 font-mono text-[9px] text-text-muted font-bold">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-text-muted" /> {test.durationMins} mins</span>
                  <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-text-muted" /> {test.maxPoints} pts</span>
                  <span className="flex items-center gap-1"><Terminal className="w-3.5 h-3.5 text-text-muted" /> {test.questions.length} problems</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 self-end sm:self-center">
                <Button variant={registered.has(test.id) ? 'secondary' : 'primary'} size="sm"
                  onClick={() => handleRegister(test.id, !registered.has(test.id))}
                  className="flex items-center gap-1.5 text-[10px]">
                  <span>{registered.has(test.id) ? 'Unregister' : 'Register'}</span>
                </Button>
                <Button variant="primary" size="sm"
                  onClick={() => router.push(`/contest/${test.id}`)}
                  disabled={test.isUpcoming || test.isEnded}
                  className="flex items-center gap-1.5">
                  <Play className="w-3 h-3 fill-white" />
                  <span>{test.isEnded ? 'Ended' : test.isUpcoming ? 'Not Started' : 'Start Test'}</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {(() => {
          const upcoming = contests.filter((c) => c.isUpcoming)
          return upcoming.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main border-b border-border-card/50 pb-2">
                Upcoming Assessments
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcoming.map((test) => (
                  <Card key={test.id} className="flex flex-col gap-2 leading-snug">
                    <div className="flex justify-between items-center gap-2">
                      <h3 className="text-xs font-bold text-text-main truncate">{test.title}</h3>
                      <Badge variant="medium">{test.scheduledDate || ''}</Badge>
                    </div>
                    <div className="flex gap-3 mt-1.5 text-[9px] font-mono text-text-muted font-bold">
                      <span>Duration: {test.durationMins} mins</span>
                      <span>Questions: {test.questions.length} challenges</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : null
        })()}
      </div>
    </AppLayout>
  )
}
