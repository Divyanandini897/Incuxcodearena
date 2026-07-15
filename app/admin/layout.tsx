'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Trophy, Code2, Users, FileText, BarChart3, Settings,
  ChevronLeft, ChevronRight, LogOut, Loader2, Terminal, Home
} from 'lucide-react'
import { supabase } from '@/src/utils/supabaseClient'

const ADMIN_EMAIL = 'deepika.tiwari.1408@gmail.com'

const adminNav = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { name: 'Contests', icon: Trophy, path: '/admin/contests' },
  { name: 'Problems', icon: Code2, path: '/admin/problems' },
  { name: 'Users', icon: Users, path: '/admin/users' },
  { name: 'Submissions', icon: FileText, path: '/admin/submissions' },
  { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { name: 'Settings', icon: Settings, path: '/admin/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    ;(async () => {
      const stored = localStorage.getItem('codenode_user_email')
      let email = stored || ''
      let name = localStorage.getItem('codenode_user_name') || ''

      if (!email) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email) {
          email = session.user.email
          localStorage.setItem('codenode_user_email', email)
          name = session.user.user_metadata?.full_name || email.split('@')[0]
          localStorage.setItem('codenode_user_name', name)
          const pid = session.user.id
          localStorage.setItem('codenode_profile_id', pid)
          fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: pid, email, name }),
          }).catch(() => {})
        }
      }

      if (email !== ADMIN_EMAIL) {
        router.replace('/')
        return
      }

      setUserName(name || email.split('@')[0])
      setIsAdmin(true)
      setChecking(false)
    })()
  }, [router])

  const handleLogout = async () => {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('sb-') || key === 'codenode_game_state_v1' || key === 'leetcode_solved_ids')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
    document.cookie.split(';').forEach((c) => {
      const name = c.trim().split('=')[0]
      if (name.startsWith('sb-')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      }
    })
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex">
      {/* Sidebar */}
      <aside className={`flex flex-col bg-[#111] border-r border-[#1e1e1e] transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'} shrink-0`}>
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Terminal className="w-4 h-4 text-emerald-500" />
            </div>
            {!collapsed && (
              <span className="font-bold text-[13px] tracking-tight text-[#f5f5f5] whitespace-nowrap">
                Admin Panel
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-6 h-6 rounded border border-[#2a2a2a] hover:bg-[#1a1a1a] text-[#666] hover:text-[#f5f5f5] items-center justify-center cursor-pointer transition-colors shrink-0"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto">
          {adminNav.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path))
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all ${
                  isActive ? 'text-[#f5f5f5] bg-emerald-500/10 border border-emerald-500/20' : 'text-[#888] hover:text-[#f5f5f5] hover:bg-[#1a1a1a]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-500' : 'text-[#666]'}`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Back to site + Logout */}
        <div className="p-2 border-t border-[#1e1e1e] flex flex-col gap-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-[#888] hover:text-[#f5f5f5] hover:bg-[#1a1a1a] transition-all"
          >
            <Home className="w-4 h-4 shrink-0 text-[#666]" />
            {!collapsed && <span>Back to Site</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-red-400 hover:bg-red-500/5 transition-all w-full text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
