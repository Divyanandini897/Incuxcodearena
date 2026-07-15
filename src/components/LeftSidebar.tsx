'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Swords, 
  Code2, 
  Trophy, 
  Bot, 
  BookOpen, 
  TrendingUp, 
  Users2, 
  FileBadge, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  Gamepad2
} from 'lucide-react';
import { useGameState } from '@/src/lib/gameState';
import { supabase } from '@/src/utils/supabaseClient';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function LeftSidebar({ 
  isMobileOpen, 
  onMobileClose, 
  isCollapsed, 
  onToggleCollapse 
}: SidebarProps) {
  const pathname = usePathname();
  const { userName } = useGameState();
  const [profileName, setProfileName] = useState(userName || 'User');
  const [profileEmail, setProfileEmail] = useState('Premium Student');

  useEffect(() => {
    async function fetchSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profile?.name) {
            setProfileName(profile.name);
          } else if (session.user.user_metadata?.full_name) {
            setProfileName(session.user.user_metadata.full_name);
          } else {
            setProfileName(session.user.email?.split('@')[0] || userName || 'User');
          }
          setProfileEmail(session.user.email || 'Premium Student');
        }
      } catch (err) {
        console.error('Error fetching LeftSidebar session:', err);
      }
    }
    fetchSession();
  }, [userName]);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Code Smash', icon: Gamepad2, path: '/code-smash' },
    { name: 'Practice Arena', icon: Swords, path: '/practice-arena' },
    { name: 'Test Arena', icon: Trophy, path: '/test-arena' },
    { name: 'AI Interview Prep', icon: Bot, path: '/ai-interview', isAi: true },
    { name: 'Learn', icon: BookOpen, path: '/journey/frontend' },
    { name: 'Profile', icon: User, path: '/profile' },
    { name: 'Admin', icon: Settings, path: '/admin/contests' }
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[var(--color-bg-sidebar)] border-r border-border-card transition-all duration-300 ease-in-out font-sans ${
          isMobileOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[260px]'}`}
      >
        {/* Sidebar Header */}
        <div className={`h-14 flex items-center border-b border-border-card/50 transition-all duration-300 relative ${
          isCollapsed && !isMobileOpen ? 'justify-center px-2' : 'justify-between px-4'
        }`}>
          <div className="flex items-center gap-3 overflow-hidden select-none">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-border-card flex items-center justify-center shrink-0">
              <img 
                src="/incux_logo.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover select-none pointer-events-none" 
              />
            </div>
            <span className={`font-black text-[13.5px] tracking-tight text-text-main whitespace-nowrap transition-all duration-300 ease-in-out origin-left ${
              isCollapsed && !isMobileOpen ? 'opacity-0 max-w-0 translate-x-[-10px] pointer-events-none' : 'opacity-100 max-w-[180px]'
            }`}>
              Incuxai Code <span className="text-primary">Arena</span>
            </span>
          </div>

          {/* Desktop Toggle Button - Floating on the border line */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-5 h-5 rounded-full border border-border-card bg-bg-card hover:bg-hover text-text-muted hover:text-text-main items-center justify-center cursor-pointer transition-all duration-300 shadow-xs absolute right-[-10px] z-50"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <ChevronLeft className={`w-3 h-3 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-2.5 flex flex-col gap-2.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.name === 'Problems' && pathname === '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onMobileClose}
                className={`relative flex items-center gap-3.5 px-3 py-2.5 rounded-md text-[13px] font-medium transition-all group shrink-0 ${
                  isActive 
                    ? 'text-text-main bg-hover' 
                    : 'text-text-muted hover:text-text-main hover:bg-hover/60'
                }`}
              >
                {/* Active left subtle bar */}
                {isActive && (
                  <motion.div 
                    layoutId="active-bar-indicator"
                    className="absolute left-0 top-2 bottom-2 w-[2px] bg-primary rounded-r"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-primary' : 'text-text-muted/70 group-hover:text-text-main'
                }`} />

                {/* Animated labels */}
                <span className={`truncate flex-1 transition-all duration-300 ease-in-out origin-left ${
                  isCollapsed && !isMobileOpen ? 'opacity-0 max-w-0 translate-x-[-10px] pointer-events-none' : 'opacity-100 max-w-[150px]'
                }`}>
                  {item.name}
                </span>

                {/* AI tag */}
                {item.isAi && (
                  <span className={`text-[9px] font-bold font-mono px-1 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 tracking-wider shrink-0 transition-all duration-300 ${
                    isCollapsed && !isMobileOpen ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100'
                  }`}>
                    AI
                  </span>
                )}

                {/* Custom hover tooltip when collapsed */}
                {isCollapsed && !isMobileOpen && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-text-main text-bg-base text-[10px] font-extrabold py-1 px-2.5 rounded-md shadow-md opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-border-card/50 flex gap-2.5 items-center select-none shrink-0 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-hover flex items-center justify-center text-xs font-bold shrink-0">
            🕵️‍♂️
          </div>
          <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out origin-left ${
            isCollapsed && !isMobileOpen ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[160px]'
          }`}>
            <p className="text-xs font-bold text-text-main truncate">{profileName}</p>
            <p className="text-[10px] text-text-muted truncate">{profileEmail}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
