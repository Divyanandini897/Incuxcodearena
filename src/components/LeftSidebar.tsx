'use client';

import React from 'react';
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
  Sparkles
} from 'lucide-react';
import { useGameState } from '@/src/lib/gameState';

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

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Practice', icon: Swords, path: '/test-arena' },
    { name: 'Problems', icon: Code2, path: '/' },
    { name: 'Contests', icon: Trophy, path: '/test-arena' },
    { name: 'AI Assistant', icon: Bot, path: '/', isAi: true },
    { name: 'Learn', icon: BookOpen, path: '/journey/frontend' },
    { name: 'Leaderboard', icon: TrendingUp, path: '/profile' },
    { name: 'Community', icon: Users2, path: '/profile' },
    { name: 'Certificates', icon: FileBadge, path: '/profile' },
    { name: 'Settings', icon: Settings, path: '/profile' }
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-bg-card border-r border-border-card transition-all duration-300 font-sans ${
          isMobileOpen ? 'translate-x-0 w-60' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-16' : 'lg:w-60'}`}
      >
        {/* Sidebar Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border-card/50">
          <div className="flex items-center gap-2 overflow-hidden select-none">
            <div className="w-8 h-8 rounded-lg bg-hover border border-border-card flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <span className="font-bold text-[13px] tracking-tight text-text-main whitespace-nowrap">
                IncuXai Arena
              </span>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-6 h-6 rounded-md border border-border-card/65 hover:bg-hover text-text-muted hover:text-text-main items-center justify-center cursor-pointer transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-2.5 flex flex-col gap-0.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.name === 'Problems' && pathname === '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onMobileClose}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all group ${
                  isActive 
                    ? 'text-text-main bg-hover' 
                    : 'text-text-muted hover:text-text-main hover:bg-hover/60'
                }`}
              >
                {/* Active left subtle bar */}
                {isActive && (
                  <motion.div 
                    layoutId="active-bar-indicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-primary rounded-r"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-primary' : 'text-text-muted/70 group-hover:text-text-main'
                }`} />

                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate flex-1">{item.name}</span>
                )}

                {/* AI tag */}
                {item.isAi && (!isCollapsed || isMobileOpen) && (
                  <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 tracking-wider">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-3 border-t border-border-card/50 flex gap-2.5 items-center select-none">
            <div className="w-8 h-8 rounded-full bg-hover flex items-center justify-center text-xs font-bold shrink-0">
              🦊
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-text-main truncate">{userName || 'User'}</p>
              <p className="text-[10px] text-text-muted truncate">Premium Student</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
