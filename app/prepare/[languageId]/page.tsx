'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dynamic Language Preparation Hub (Curated Elite Tracks)
 * Route: /prepare/[languageId]
 */

import React, { useMemo, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import Navigation from '@/src/components/Navigation';
import { useGameState } from '@/src/lib/gameState';
import { CURATED_TRACKS } from '../curatedData';

/* Slug → display mapping */
const LANGUAGE_SLUG_MAP: Record<string, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  'c++': 'C++',
  go: 'Go',
  golang: 'Go',
};

interface TierConfig {
  key: string;
  title: string;
  subtitle: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
}

const TIERS: TierConfig[] = [
  {
    key: 'basic',
    title: 'Basic Tracks',
    subtitle: 'Foundational syntax & basics',
    dotColor: 'bg-sky-400',
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-400',
  },
  {
    key: 'easy',
    title: 'Easy Tracks',
    subtitle: 'Simple implementation & algorithms',
    dotColor: 'bg-emerald-400',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
  },
  {
    key: 'medium',
    title: 'Medium Tracks',
    subtitle: 'Intermediate concepts & patterns',
    dotColor: 'bg-amber-400',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
  },
  {
    key: 'hard',
    title: 'Hard Tracks',
    subtitle: 'Advanced mechanics & architecture',
    dotColor: 'bg-rose-400',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-400',
  },
];

export default function LanguagePrepPage() {
  const params = useParams();
  const { streak } = useGameState();
  const rawSlug = (params.languageId as string)?.toLowerCase() ?? '';
  
  // Canonical language lookup
  const canonicalSlug = rawSlug === 'c++' ? 'cpp' : rawSlug;
  const languageKey = LANGUAGE_SLUG_MAP[rawSlug] ?? null;

  // Retrieve curated tracks for this language
  const languageTracks = useMemo(() => {
    if (!canonicalSlug) return null;
    return CURATED_TRACKS[canonicalSlug] ?? null;
  }, [canonicalSlug]);

  const totalCount = useMemo(() => {
    if (!languageTracks) return 0;
    return Object.values(languageTracks).reduce((acc, curr) => acc + curr.length, 0);
  }, [languageTracks]);

  // Load manual checkbox progress from localStorage
  const [completedKeys, setCompletedKeys] = useState<string[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem('codenode_prep_completed_tasks');
    if (stored) {
      try {
        setCompletedKeys(JSON.parse(stored));
      } catch (e) {
        // Safe fallback
      }
    }
  }, []);

  if (!languageKey || !languageTracks || totalCount === 0) {
    return (
      <div className="min-h-screen bg-bg-base text-text-main flex flex-col antialiased">
        <Navigation streakCount={streak} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md border border-border-card bg-bg-card p-8 rounded-xl shadow-sm">
            <h1 className="text-xl font-bold text-text-main mb-2">
              Track Under Preparation
            </h1>
            <p className="text-text-muted text-sm mb-6">
              This Language Track is currently under preparation. Check back soon!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-main flex flex-col antialiased">
      <Navigation streakCount={streak} />

      <main className="flex-1 p-6 max-w-[1000px] w-full mx-auto flex flex-col gap-6">
        {/* Header Section */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-card pb-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {languageKey} Prep Tracks
              </h1>
              <p className="text-sm text-text-muted mt-1">
                Choose a difficulty track to begin practicing and trace your progress.
              </p>
            </div>
            <div className="text-sm text-text-muted bg-bg-card border border-border-card px-4 py-2 rounded-lg font-mono self-start md:self-auto">
              Total Programs: <span className="text-text-main font-bold">{totalCount}</span>
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <div className="flex flex-col gap-4">
          {TIERS.map((tier) => {
            const list = languageTracks[tier.key] ?? [];
            
            // Calculate solved based on localStorage checked keys
            const solvedInTier = list.filter((_, index) => 
              completedKeys.includes(`${canonicalSlug}-${tier.key}-${index}`)
            ).length;
            
            const percentage = list.length > 0 ? Math.round((solvedInTier / list.length) * 100) : 0;

            return (
              <Link
                key={tier.key}
                href={`/prepare/${rawSlug}/${tier.key}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-bg-card border border-border-card hover:border-text-muted/30 rounded-xl transition-all gap-4 cursor-pointer shadow-sm"
              >
                {/* Info Column */}
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${tier.dotColor}`} />
                  <div>
                    <h2 className="font-bold text-sm text-text-main uppercase tracking-wider group-hover:text-primary transition-colors">
                      {tier.title}
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">{tier.subtitle}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 max-w-xs flex flex-col gap-1.5 sm:mx-6">
                  <div className="flex justify-between text-[10px] font-semibold text-text-muted">
                    <span>Solved: {solvedInTier} / {list.length}</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-bg-base rounded-full overflow-hidden border border-border-card p-[1px]">
                    <div
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Arrow Column */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tier.badgeBg} ${tier.badgeText}`}>
                    {list.length} Problems
                  </span>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
