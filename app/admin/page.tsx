'use client'

import { useState, useEffect } from 'react'
import { Users, Code2, Trophy, FileText, Loader2, Clock, Activity } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalProblems: number
  totalContests: number
  totalSubmissions: number
  publishedContests: number
  draftContests: number
  recentSubmissions: Array<{
    id: string
    status: string
    createdAt: string
    user: { name: string; email: string }
    problem: { title: string; leetcodeId: number }
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  useEffect(() => {
    setEmail(localStorage.getItem('codenode_user_email') || '')
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { 'x-admin-email': localStorage.getItem('codenode_user_email') || '' },
        })
        if (res.ok) setStats(await res.json())
      } catch {} finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    )
  }

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { label: 'Total Problems', value: stats?.totalProblems ?? 0, icon: Code2, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    { label: 'Total Contests', value: stats?.totalContests ?? 0, icon: Trophy, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', sub: `${stats?.publishedContests ?? 0} published, ${stats?.draftContests ?? 0} drafts` },
    { label: 'Total Submissions', value: stats?.totalSubmissions ?? 0, icon: FileText, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  ]

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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-bold text-[#f5f5f5]">Admin Dashboard</h1>
        <p className="text-xs text-[#888] mt-1">Overview of the IncuxAI Arena platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono font-bold text-[#888] uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold text-[#f5f5f5] mt-0.5 font-mono">{card.value.toLocaleString()}</p>
                {card.sub && <p className="text-[10px] text-[#666] mt-0.5">{card.sub}</p>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-bold text-[#f5f5f5]">Recent Submissions</h2>
        </div>
        {stats?.recentSubmissions && stats.recentSubmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e1e1e] text-[10px] font-mono font-bold text-[#666] uppercase tracking-wider">
                  <th className="py-2 px-3">User</th>
                  <th className="py-2 px-3">Problem</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]/60">
                {stats.recentSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="py-2.5 px-3 font-medium text-[#f5f5f5]">{sub.user.name || sub.user.email}</td>
                    <td className="py-2.5 px-3 text-[#aaa]">{sub.problem.leetcodeId}. {sub.problem.title}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={sub.status} /></td>
                    <td className="py-2.5 px-3 text-[#666] font-mono text-[10px]">
                      {new Date(sub.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[#666] py-4 text-center">No submissions yet</p>
        )}
      </div>
    </div>
  )
}
