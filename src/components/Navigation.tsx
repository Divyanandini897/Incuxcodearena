'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame, Home, Sun, Moon, Terminal } from 'lucide-react';
import { useGameState } from '@/src/lib/gameState';
import Link from 'next/link';

interface NavigationProps {
  streakCount?: number;
}

const AVATARS: Record<string, { emoji: string; gradient: string }> = {
  sherlock: { emoji: '🕵️‍♂️', gradient: 'from-amber-600 to-orange-700' },
  neo: { emoji: '🕶️', gradient: 'from-slate-700 to-slate-900' },
  yoda: { emoji: '🧙‍♂️', gradient: 'from-emerald-600 to-teal-700' },
  stark: { emoji: '🦾', gradient: 'from-red-600 to-yellow-600' },
};

export default function Navigation({ streakCount = 5 }: NavigationProps) {
  const { theme, updateTheme, avatar } = useGameState();
  const avatarInfo = AVATARS[avatar] || AVATARS.sherlock;

  return (
    <header className="h-16 border-b border-[var(--color-border-header)] bg-[var(--color-bg-header)] text-[var(--color-text-header)] shadow-sm flex items-center justify-between px-8 select-none font-sans sticky top-0 z-40 transition-colors duration-300">
      
      {/* Left Section: Platform logo and primary navigation links */}
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9.5 h-9.5 rounded-xl bg-gradient-to-tr from-primary to-accent-secondary flex items-center justify-center shadow-md shadow-primary/15 group-hover:scale-105 transition-transform">
            <code className="text-white font-mono font-black text-base select-none">&lt;/&gt;</code>
          </div>
          <span className="font-sans text-base font-black tracking-tight text-white">
            IncuXai <span className="text-primary font-extrabold">Code Arena</span>
          </span>
        </Link>

        {/* Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
          <Link href="/" className="text-white/80 hover:text-primary transition-colors flex items-center gap-2">
            <Home className="w-4.5 h-4.5 text-white/60" />
            <span>Dashboard</span>
          </Link>
          <Link href="/test-arena" className="text-white/80 hover:text-primary transition-colors flex items-center gap-2">
            <Terminal className="w-4.5 h-4.5 text-white/60" />
            <span>Test Arena</span>
          </Link>
        </nav>
      </div>

      {/* Right Section: Streak and theme tracking */}
      <div className="flex items-center gap-6">
        
        {/* Theme Switcher Toggle Button */}
        <button 
          onClick={() => updateTheme(theme === 'theme-light' ? 'theme-dark' : 'theme-light')}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--color-border-header)] bg-white/5 text-white/70 hover:text-white hover:border-primary/50 transition-all cursor-pointer shadow-sm"
          title={`Switch to ${theme === 'theme-light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'theme-light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5 text-amber-400 fill-amber-400/10" />}
        </button>

        <div className="h-6 w-px bg-[var(--color-border-header)]" />

        {/* Streak Tracking Meter */}
        <div 
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold shadow-sm animate-float"
          title="Daily problem solving streak!"
        >
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500/15" />
          <span>{streakCount} Day Streak</span>
        </div>

        {/* Profile Avatar Button */}
        <Link href="/profile" className="flex items-center gap-3 pl-3 border-l border-[var(--color-border-header)] group cursor-pointer" title="Go to My Profile">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${avatarInfo.gradient} p-[1.5px] group-hover:scale-105 transition-transform flex items-center justify-center shadow-md`}>
            <div className="w-full h-full rounded-full bg-[var(--color-bg-header)] flex items-center justify-center text-xl select-none">
              {avatarInfo.emoji}
            </div>
          </div>
        </Link>

      </div>

    </header>
  );
}
