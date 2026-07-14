'use client';

import React from 'react';
import { useGameState, getXpForNextLevel } from '@/src/lib/gameState';
import { 
  Sun, 
  Moon, 
  Menu, 
  Flame, 
  Award, 
  Coins, 
  Bell,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface TopNavbarProps {
  onMobileMenuOpen: () => void;
}

export default function TopNavbar({ onMobileMenuOpen }: TopNavbarProps) {
  const { theme, updateTheme, streak, level, xp, gold, userName, profilePicture } = useGameState();

  const handleToggleTheme = () => {
    updateTheme(theme === 'theme-light' ? 'theme-dark' : 'theme-light');
  };

  const xpNeeded = getXpForNextLevel(level);

  return (
    <header className="sticky top-0 z-30 h-14 w-full bg-bg-card/85 backdrop-blur-md border-b border-border-card/50 flex items-center justify-between px-6 select-none font-sans">
      
      {/* Left section: mobile toggle and minimal breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden p-1.5 rounded-md hover:bg-hover text-text-muted hover:text-text-main cursor-pointer transition-colors"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-text-muted">
          <span>Practice</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          <span className="text-text-main font-semibold">Dashboard</span>
        </div>
      </div>

      {/* Right section: clean status metrics on baseline, theme, and profile */}
      <div className="flex items-center gap-6">
        
        {/* Baseline status widgets */}
        <div className="hidden md:flex items-center gap-5 text-xs font-semibold border-r border-border-card/50 pr-6">
          {/* Streak */}
          <div className="flex items-center gap-1.5 text-text-muted hover:text-text-main transition-colors" title="Daily Streak">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500/10" />
            <span className="font-mono">{streak}d</span>
          </div>

          {/* Gold */}
          <div className="flex items-center gap-1.5 text-text-muted hover:text-text-main transition-colors" title="Platform Gold">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="font-mono">{gold}g</span>
          </div>

          {/* Level / XP */}
          <div className="flex items-center gap-1.5 text-text-muted" title={`Level ${level}: ${xp}/${xpNeeded} XP`}>
            <Award className="w-4 h-4 text-primary" />
            <span>Lvl {level}</span>
            <span className="text-[10px] text-text-muted/65 font-mono">({xp}/{xpNeeded} XP)</span>
          </div>
        </div>

        {/* Theme Toggle Button (Borderless Hover) */}
        <button
          onClick={handleToggleTheme}
          className="p-1.5 rounded-md hover:bg-hover text-text-muted hover:text-text-main cursor-pointer transition-colors"
          title="Toggle Theme"
        >
          {theme === 'theme-light' ? (
            <Moon className="w-4.5 h-4.5" />
          ) : (
            <Sun className="w-4.5 h-4.5 text-yellow-500" />
          )}
        </button>

        {/* Notifications Mock */}
        <button
          className="relative p-1.5 rounded-md hover:bg-hover text-text-muted hover:text-text-main cursor-pointer transition-colors"
          title="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        {/* Profile Avatar trigger */}
        <Link href="/profile" className="flex items-center gap-2 pl-1 cursor-pointer group">
          <div className="w-7.5 h-7.5 rounded-full bg-gradient-to-tr from-primary/80 to-purple-500/80 p-[1.5px] shadow-sm group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full rounded-full bg-bg-card flex items-center justify-center overflow-hidden text-sm">
              {profilePicture ? (
                <img src={profilePicture} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-text-main select-none">
                  {(userName || '?')[0].toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="hidden lg:flex flex-col text-left leading-none">
            <span className="text-xs font-semibold text-text-main group-hover:text-primary transition-colors">{userName}</span>
          </div>
        </Link>

      </div>
    </header>
  );
}
