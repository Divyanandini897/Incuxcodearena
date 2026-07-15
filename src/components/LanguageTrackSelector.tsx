'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import Badge from './ui/Badge';

export interface LanguageTrack {
  name: string;
  completed: number;
  total: number;
  lastUsed: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface LanguageTrackSelectorProps {
  languages: LanguageTrack[];
  selectedLanguage: string | null;
  onSelect: (language: string | null) => void;
}

export default function LanguageTrackSelector({
  languages,
  selectedLanguage,
  onSelect,
}: LanguageTrackSelectorProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main border-b border-border-card pb-2 w-full">
          Language Tracks
        </h3>
        {selectedLanguage && (
          <button
            onClick={() => onSelect(null)}
            className="shrink-0 text-[10px] font-mono font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer pb-2 ml-3"
          >
            Clear filter
          </button>
        )}
      </div>
      <div className="relative w-full">
        <div className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1 snap-x scroll-smooth custom-scrollbar">
          {languages.map((lang) => {
            const progressPercent = Math.min(
              100,
              Math.floor((lang.completed / lang.total) * 100)
            );
            const isActive = selectedLanguage === lang.name;

            return (
              <button
                key={lang.name}
                onClick={() => onSelect(isActive ? null : lang.name)}
                className={`snap-start flex-none w-[280px] flex flex-col justify-between gap-5 p-6 rounded-2xl border bg-bg-card shadow-card-custom transition-all duration-300 select-none group text-left cursor-pointer ${
                  isActive
                    ? 'border-primary shadow-[0_0_12px_rgba(0,122,51,0.2)] -translate-y-1.5'
                    : 'border-border-card hover:-translate-y-1.5 hover:shadow-md hover:border-primary/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col leading-none">
                    <h4 className="text-[13.5px] font-black text-text-main group-hover:text-primary transition-colors">
                      {lang.name}
                    </h4>
                    <span className="text-[9px] text-text-muted font-mono font-bold mt-1 uppercase">
                      {lang.lastUsed}
                    </span>
                  </div>
                  <Badge
                    variant={
                      lang.difficulty === 'Easy'
                        ? 'easy'
                        : lang.difficulty === 'Medium'
                          ? 'medium'
                          : 'hard'
                    }
                  >
                    {lang.difficulty}
                  </Badge>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-text-muted">
                    <span>
                      {lang.completed}/{lang.total} lessons
                    </span>
                    <span className="text-text-main">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-hover rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary shadow-[0_0_8px_rgba(0,122,51,0.35)] rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[9.5px] text-text-muted font-mono font-bold mt-1 leading-none">
                    {lang.total - lang.completed} lessons left
                  </span>
                </div>

                <div className="w-full flex items-center justify-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-[10px] bg-primary text-white hover:bg-primary-hover shadow-sm transition-all duration-200">
                  <span>Continue Learning</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
