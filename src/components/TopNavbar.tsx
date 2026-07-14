'use client';

import React, { useState, useEffect } from 'react';
import { useGameState, getXpForNextLevel } from '@/src/lib/gameState';
import { supabase } from '@/src/utils/supabaseClient';
import { 
  Sun, 
  Moon, 
  Menu, 
  Flame, 
  Award, 
  Coins, 
  Bell,
  ChevronRight,
  User,
  LogOut
} from 'lucide-react';
import Link from 'next/link';

interface TopNavbarProps {
  onMobileMenuOpen: () => void;
}

export default function TopNavbar({ onMobileMenuOpen }: TopNavbarProps) {
  const { theme, updateTheme, streak, level, xp, gold, userName, avatar } = useGameState();
  const [profileName, setProfileName] = useState(userName);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profile?.name) {
            setProfileName(profile.name);
          } else if (session.user.user_metadata?.full_name) {
            setProfileName(session.user.user_metadata.full_name);
          } else {
            setProfileName(session.user.email?.split('@')[0] || userName);
          }
        }
      } catch (err) {
        console.error('Error fetching TopNavbar session:', err);
      }
    }
    fetchSession();
  }, [userName]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleTheme = () => {
    updateTheme(theme === 'theme-light' ? 'theme-dark' : 'theme-light');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/auth/login';
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const xpNeeded = getXpForNextLevel(level);

  // Avatar emoji lookup
  const avatarEmoji = avatar === 'sherlock' ? '🦊' : avatar === 'neo' ? '🐈' : avatar === 'yoda' ? '🐸' : '🦁';

  return (
    <header className="sticky top-0 z-30 h-14 w-full bg-[var(--color-bg-nav)] backdrop-blur-md border-b border-border-card/50 flex items-center justify-between px-6 select-none font-sans">
      
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

      {/* Right section: theme toggle and profile */}
      <div className="flex items-center gap-4">
        
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

        {/* Profile Avatar Trigger dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 pl-1 cursor-pointer group border-0 bg-transparent p-0 focus:outline-none"
          >
            <div className="w-7.5 h-7.5 rounded-full bg-hover flex items-center justify-center text-sm shadow-sm border border-border-card/45 group-hover:scale-105 transition-transform duration-200">
              {avatarEmoji}
            </div>
            <div className="hidden lg:flex flex-col text-left leading-none">
              <span className="text-xs font-semibold text-text-main group-hover:text-primary transition-colors">{profileName}</span>
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-bg-card border border-border-card rounded-2xl shadow-card-custom p-1.5 flex flex-col z-50 text-left">
              <Link 
                href="/profile" 
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-text-main hover:bg-hover transition-colors"
              >
                <User className="w-4 h-4 text-text-muted" /> Profile Overview
              </Link>
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-500/5 transition-colors border-0 text-left w-full cursor-pointer bg-transparent"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
