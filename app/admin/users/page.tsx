'use client'

import { useState, useEffect } from 'react'
import { Loader2, Mail, Calendar } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  name: string
  username: string | null
  created_at: string
  _count?: { submissions: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users', {
          headers: { 'x-admin-email': localStorage.getItem('codenode_user_email') || '' },
        })
        if (res.ok) setUsers(await res.json())
      } catch {} finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-[#f5f5f5]">Users</h1>
        <p className="text-xs text-[#888] mt-1">{users.length} registered users</p>
      </div>

      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e1e1e] text-[10px] font-mono font-bold text-[#666] uppercase tracking-wider">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="py-3 px-4 font-medium text-[#f5f5f5]">{u.name}</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 text-[#aaa]">
                      <Mail className="w-3 h-3 text-[#666]" /> {u.email}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#666]">{u.username || '—'}</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 text-[#666] font-mono text-[10px]">
                      <Calendar className="w-3 h-3" /> {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-[#666] text-xs">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
