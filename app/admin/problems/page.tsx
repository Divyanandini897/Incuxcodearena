'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface ProblemItem {
  id: string
  leetcodeId: number
  title: string
  difficulty: string
  category: string
  isPublished: boolean
  acceptance: string | null
  createdAt: string
}

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<ProblemItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch('/api/admin/problems', {
          headers: { 'x-admin-email': localStorage.getItem('codenode_user_email') || '' },
        })
        if (res.ok) setProblems(await res.json())
      } catch {} finally {
        setLoading(false)
      }
    }
    fetchProblems()
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>

  const DifficultyBadge = ({ d }: { d: string }) => {
    const colors: Record<string, string> = {
      Easy: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      Medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      Hard: 'text-red-500 bg-red-500/10 border-red-500/20',
    }
    return <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${colors[d] || ''}`}>{d}</span>
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-[#f5f5f5]">Problems</h1>
        <p className="text-xs text-[#888] mt-1">{problems.length} problems in the database</p>
      </div>

      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e1e1e] text-[10px] font-mono font-bold text-[#666] uppercase tracking-wider">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Acceptance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]/60">
              {problems.map((p) => (
                <tr key={p.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="py-3 px-4 font-mono text-[#666]">{p.leetcodeId}</td>
                  <td className="py-3 px-4 font-medium text-[#f5f5f5]">{p.title}</td>
                  <td className="py-3 px-4"><DifficultyBadge d={p.difficulty} /></td>
                  <td className="py-3 px-4 text-[#aaa]">{p.category}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${
                      p.isPublished ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                    }`}>
                      {p.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#666]">{p.acceptance || '—'}</td>
                </tr>
              ))}
              {problems.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-[#666] text-xs">No problems found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
