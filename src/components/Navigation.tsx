'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Flame, LogOut, User } from 'lucide-react';
import { supabase } from '@/src/utils/supabaseClient';

interface NavigationProps {
  streakCount?: number;
}

export default function Navigation({ streakCount = 124 }: NavigationProps) {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            if (data.name) setName(data.name);
            if (data.avatar_url) setAvatarUrl(data.avatar_url);
          }
        });
    });
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('leetcode_solved_ids');
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const name = c.trim().split('=')[0];
      if (name.startsWith('sb-')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      }
    }
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    }
    sessionStorage.clear();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="h-14 border-b border-[#1e1e1e] bg-[#0c0c0c] flex items-center justify-between px-6 select-none font-sans">
      
      {/* Left Section: Platform logo and primary navigation links */}
      <div className="flex items-center gap-8">
        {/* Minimalist Logo */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-base font-black tracking-widest text-[#f5f5f5] uppercase bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
            CODE<span className="text-emerald-400">NODE</span>
          </span>
        </div>

        {/* Primary Navigation Text Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium">
          <a href="#problems" className="text-[#f5f5f5] font-semibold transition-colors">Problems</a>
          <a href="#contest" className="text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors">Contest</a>
          <a href="#discuss" className="text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors">Discuss</a>
          <a href="#interview" className="text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors">Interview</a>
        </nav>
      </div>

      {/* Right Section: Global search input, bell, streak tracking, avatar */}
      <div className="flex items-center gap-5">
        
        {/* Streak Tracking Meter */}
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[11px] font-bold"
          title="Daily problem solving streak!"
        >
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20 animate-pulse" />
          <span>{streakCount} d</span>
        </div>

        {/* Notification Bell */}
        <button 
          className="relative text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors p-1 rounded-lg hover:bg-[#1e1e1e] cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
          </span>
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1e1e1e]">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 p-[1.5px] cursor-pointer hover:opacity-80 transition-opacity">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name || 'User'}
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center text-[10px] font-bold text-emerald-400">
                {initials}
              </div>
            )}
          </div>
          {name && (
            <span className="hidden md:block text-xs text-[#c0c0c0] max-w-[120px] truncate">
              {name}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-[#a0a0a0] hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-[#1e1e1e] cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

    </header>
  );
}
