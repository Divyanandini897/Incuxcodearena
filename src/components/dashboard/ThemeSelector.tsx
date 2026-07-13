'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGameState } from '@/src/lib/gameState';
import { Palette } from 'lucide-react';

export default function ThemeSelector() {
  const { theme, updateTheme } = useGameState();

  const themes = [
    {
      id: 'theme-light',
      name: 'Light Mode',
      primaryBg: 'bg-[#2d4a43]',
      secondaryBg: 'bg-[#c2410c]',
      borderStyle: 'border-[#2d4a43]',
      text: 'text-[#2d4a43]',
    },
    {
      id: 'theme-dark',
      name: 'Dark Mode',
      primaryBg: 'bg-[#1ba94c]',
      secondaryBg: 'bg-[#34d399]',
      borderStyle: 'border-[#1ba94c]',
      text: 'text-[#1ba94c]',
    },
  ];

  return (
    <div className="bg-bg-card rounded-xl border border-border-card p-5 flex flex-col gap-4 glow-border">
      <div className="flex items-center gap-2.5 border-b border-border-card pb-3">
        <Palette className="w-5 h-5 text-primary animate-pulse" />
        <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-text-main">
          Theme Switcher
        </h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {themes.map((t) => {
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => updateTheme(t.id)}
              className={`flex items-center justify-between p-3.5 rounded-lg transition-all text-sm font-bold cursor-pointer ${
                isActive
                  ? 'bg-primary/10 border border-primary text-text-main scale-[1.03]'
                  : 'bg-bg-base/40 border border-transparent hover:border-border-card text-text-muted hover:text-text-main'
              }`}
            >
              <div className="flex items-center gap-3">
                <span>{t.name}</span>
              </div>
              <div className="flex gap-1.5">
                <span className={`w-4 h-4 rounded-full ${t.primaryBg}`} />
                <span className={`w-4 h-4 rounded-full ${t.secondaryBg}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
