'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, Bell, Flame } from 'lucide-react';

interface NavigationProps {
  streakCount?: number;
}

export default function Navigation({ streakCount = 124 }: NavigationProps) {
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

        {/* User Profile Avatar Placeholder */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1e1e1e]">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 p-[1.5px] cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center text-[10px] font-bold text-emerald-400">
              HN
            </div>
          </div>
        </div>

      </div>

    </header>
  );
}
