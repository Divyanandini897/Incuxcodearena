'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame, Award, Home } from 'lucide-react';
import { useGameState, getXpForNextLevel } from '@/src/lib/gameState';
import Link from 'next/link';

interface NavigationProps {
  streakCount?: number;
}

export default function Navigation({ streakCount = 5 }: NavigationProps) {
  const { level, xp } = useGameState();
  const xpNeeded = getXpForNextLevel(level);
  const xpPercentage = Math.min(100, Math.floor((xp / xpNeeded) * 100));

  return (
    <header className="h-16 border-b border-border-card bg-bg-card shadow-sm flex items-center justify-between px-8 select-none font-sans sticky top-0 z-40">
      
      {/* Left Section: Platform logo and primary navigation links */}
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-mono text-lg font-black tracking-widest text-text-main uppercase bg-primary/10 px-3.5 py-1.5 rounded border border-primary/20 hover:scale-[1.02] transition-transform">
            CODE<span className="text-primary">NODE</span>
          </span>
        </Link>

        {/* Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
          <Link href="/" className="text-text-main hover:text-primary transition-colors flex items-center gap-2">
            <Home className="w-4.5 h-4.5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/profile" className="text-text-muted hover:text-primary transition-colors flex items-center gap-2">
            <Award className="w-4.5 h-4.5" />
            <span>My Profile</span>
          </Link>
        </nav>
      </div>

      {/* Right Section: Level Bar and streak tracking */}
      <div className="flex items-center gap-6">
        
        {/* XP Level Progress Bar */}
        <div className="hidden sm:flex flex-col items-end gap-1.5 max-w-[200px] w-44 font-mono text-xs">
          <div className="flex justify-between w-full font-bold text-text-main">
            <span>LEVEL {level}</span>
            <span className="text-text-muted">{xp}/{xpNeeded} XP</span>
          </div>
          <div className="w-full h-3 bg-bg-base rounded-full overflow-hidden border border-border-card p-[1px]">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent-secondary transition-all duration-500 rounded-full" 
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>

        <div className="h-6 w-px bg-border-card hidden sm:block" />

        {/* Streak Tracking Meter */}
        <div 
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-xs font-bold shadow-sm"
          title="Daily problem solving streak!"
        >
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500/15" />
          <span>{streakCount} Day Streak</span>
        </div>

      </div>

    </header>
  );
}
