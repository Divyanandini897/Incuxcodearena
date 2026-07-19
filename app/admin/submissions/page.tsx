'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface SubmissionItem {
  id: string
  status: string
  language: string
  runtime: string | null
  createdAt: string
  user: { name: string; email: string }
  problem: { title: string; leetcodeId: number }
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch('/api/admin/submissions', {
          headers: { 'x-admin-email': localStorage.getItem('codenode_user_email') || '' },
        })
        if (res.ok) setSubmissions(await res.json())
      } catch {} finally {
        setLoading(false)
      }
    }
    fetchSubmissions()
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      Accepted: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      Wrong_Answer: 'text-red-500 bg-red-500/10 border-red-500/20',
      Compile_Error: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
      Runtime_Error: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      Time_Limit_Exceeded: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    }
    const cls = colors[status] || 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    return <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${cls}`}>{status.replace(/_/g, ' ')}</span>
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-[#f5f5f5]">Submissions</h1>
        <p className="text-xs text-[#888] mt-1">{submissions.length} recent submissions</p>
      </div>

      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e1e1e] text-[10px] font-mono font-bold text-[#666] uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Problem</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Runtime</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]/60">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="py-3 px-4 font-medium text-[#f5f5f5]">{s.user.name || s.user.email}</td>
                  <td className="py-3 px-4 text-[#aaa]">{s.problem.leetcodeId}. {s.problem.title}</td>
                  <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                  <td className="py-3 px-4 text-[#666] font-mono text-[10px]">{s.language}</td>
                  <td className="py-3 px-4 text-[#666] font-mono">{s.runtime || '—'}</td>
                  <td className="py-3 px-4 text-[#666] font-mono text-[10px]">{new Date(s.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-[#666] text-xs">No submissions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
