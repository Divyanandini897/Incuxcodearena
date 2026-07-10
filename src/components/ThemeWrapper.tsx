'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useGameState } from '@/src/lib/gameState';
import CompanionPet from '@/src/components/dashboard/CompanionPet';
import { Sparkles, Bot } from 'lucide-react';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useGameState();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Diagnostic log to see theme changes on the client
  useEffect(() => {
    if (mounted) {
      console.log(`[ThemeWrapper] Active Theme changed to: ${theme}`);
    }
  }, [theme, mounted]);

  // Fallback to default theme until client hydration is complete
  const currentTheme = mounted ? theme : 'theme-light';
  
  return (
    <body className={`${currentTheme} min-h-screen bg-bg-base text-text-main transition-colors duration-300 antialiased relative`}>
      {children}
      
      {/* Floating collapsible companion pet assistant */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans select-none">
        {isOpen ? (
          <div className="w-80 shadow-2xl rounded-xl border border-border-card bg-bg-card max-h-[85vh] overflow-y-auto glow-border">
            <div className="bg-bg-base/80 backdrop-blur-sm px-4 py-2 border-b border-border-card flex items-center justify-between text-xs font-bold text-primary">
              <span className="flex items-center gap-1.5 uppercase font-mono font-bold tracking-wider">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-accent-secondary" />
                Dev Companion
              </span>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-text-muted hover:text-text-main hover:bg-neutral-800 cursor-pointer px-2 py-0.5 rounded border border-border-card font-bold transition-colors"
              >
                Hide ×
              </button>
            </div>
            <div className="p-1.5">
              <CompanionPet />
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/10 glow-border"
            title="Open Developer Companion"
          >
            <Bot className="w-6 h-6 animate-float" />
          </button>
        )}
      </div>
    </body>
  );
}
