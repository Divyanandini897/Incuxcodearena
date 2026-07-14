'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Flame, Home, Sun, Moon, Terminal, Search, Bell, LogOut, User } from 'lucide-react';
import { useGameState } from '@/src/lib/gameState';
import { supabase } from '@/src/utils/supabaseClient';

interface UserProfile {
  name: string | null;
  avatar_url: string | null;
}

interface NavigationProps {
  streakCount?: number;
  userProfile?: UserProfile | null;
}

const AVATARS: Record<string, { emoji: string; gradient: string }> = {
  sherlock: { emoji: '🕵️‍♂️', gradient: 'from-amber-600 to-orange-700' },
  neo:      { emoji: '🕶️',    gradient: 'from-slate-700 to-slate-900' },
  yoda:     { emoji: '🧙‍♂️',   gradient: 'from-emerald-600 to-teal-700' },
  stark:    { emoji: '🦾',    gradient: 'from-red-600 to-yellow-600' },
};

export default function Navigation({ streakCount = 0, userProfile = null }: NavigationProps) {
  const router = useRouter();
  const { theme, toggleTheme, userName, streak, avatar, resetGame } = useGameState();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Prefer the live Supabase profile name; fall back to the persisted game-state name
  const displayName = userProfile?.name || userName || 'User';

  // Use the avatar key stored in game state; fall back to sherlock
  const avatarInfo = AVATARS[avatar] || AVATARS.sherlock;

  // Use either the incoming prop or the gameState context value
  const activeStreak = streakCount || streak || 0;

  /**
   * Full sign-out teardown:
   *  1. Clear all Supabase sb-* localStorage keys
   *  2. Clear game state key
   *  3. Clear all Supabase sb-* cookies
   *  4. Call supabase.auth.signOut()
   *  5. Reset in-memory game state
   *  6. Hard-redirect to /auth/login
   */
  const handleLogout = async () => {
    setIsDropdownOpen(false);

    // 1. Clear Supabase session localStorage keys only.
    // Progress keys (codenode_game_state_v1, leetcode_solved_ids) are preserved —
    // they are local caches; the canonical progress lives in Supabase.
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // 2. Clear Supabase sb-* cookies
    document.cookie.split(';').forEach((c) => {
      const cookieName = c.trim().split('=')[0];
      if (cookieName.startsWith('sb-')) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      }
    });

    // 3. Clear session storage
    sessionStorage.clear();

    // 4. Sign out from Supabase
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('[Navigation] Supabase signOut error:', error);
    }

    // 5. Reset in-memory game state (clears stale userName, streak, solvedIds, etc.)
    resetGame();

    // 6. Navigate to login
    router.replace('/auth/login');
  };

  return (
    <nav className="border-b border-border-card/60 bg-bg-card/80 backdrop-blur-md sticky top-0 z-50 w-full select-none">
      <div className="max-w-[1600px] w-full mx-auto px-6 h-14 flex items-center justify-between gap-4">

        {/* Left Side: Logo & Home */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:border-primary/45 transition-colors">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-bold tracking-tight text-text-main">
              LeetCode<span className="text-primary">Clone</span>
            </span>
          </Link>

          <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-main transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-4">

          {/* Streak Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/5 border border-orange-500/15 text-orange-500 text-xs font-mono font-bold">
            <Flame className="w-3.5 h-3.5 fill-orange-500/10 animate-pulse" />
            <span>{activeStreak} days</span>
          </div>

          {/* Search */}
          <button className="p-2 text-text-muted hover:text-text-main transition-colors rounded-lg hover:bg-hover/30">
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button className="p-2 text-text-muted hover:text-text-main transition-colors rounded-lg hover:bg-hover/30 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
          </button>

          {/* Dark Mode Toggle — now uses toggleTheme from gameState */}
          <button
            onClick={toggleTheme}
            className="p-2 text-text-muted hover:text-text-main transition-colors rounded-lg hover:bg-hover/30"
            title="Toggle theme mode"
          >
            {theme === 'theme-dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-hover/30 transition-colors focus:outline-none"
            >
              <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${avatarInfo.gradient} flex items-center justify-center text-xs shadow-inner`}>
                {userProfile?.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt={displayName}
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{avatarInfo.emoji}</span>
                )}
              </div>
              <span className="text-xs font-semibold text-text-main hidden sm:inline-block max-w-[100px] truncate">
                {displayName}
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-bg-card border border-border-card/70 shadow-lg py-1.5 z-50 text-xs text-text-main">
                <div className="px-3 py-2 border-b border-border-card/40 text-text-muted font-medium font-mono text-[10px] uppercase tracking-wider">
                  Account Operations
                </div>

                <Link
                  href="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-hover/40 transition-colors font-semibold"
                >
                  <User className="w-3.5 h-3.5 text-text-muted" />
                  <span>View Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/5 transition-colors font-semibold border-t border-border-card/20 text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}