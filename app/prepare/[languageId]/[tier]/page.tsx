'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dedicated Tier Page with Progress Tracking
 * Route: /prepare/[languageId]/[tier]
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PROBLEMS_DATA } from '@/src/data/data';
import { CURATED_TRACKS } from '../../curatedData';

import Navigation from '@/src/components/Navigation';
import { useGameState } from '@/src/lib/gameState';

/* Slug → starterCode language key mapping */
const LANGUAGE_SLUG_MAP: Record<string, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  'c++': 'C++',
  go: 'Go',
  golang: 'Go',
};

const TIER_META: Record<string, { title: string; subtitle: string; color: string; badgeColor: string }> = {
  basic: {
    title: 'Basic Track',
    subtitle: 'Foundational syntax & language basics',
    color: 'text-sky-400',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  easy: {
    title: 'Easy Track',
    subtitle: 'Simple implementation & algorithms',
    color: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  medium: {
    title: 'Medium Track',
    subtitle: 'Intermediate concepts & patterns',
    color: 'text-amber-400',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  hard: {
    title: 'Hard Track',
    subtitle: 'Advanced mechanics & architecture',
    color: 'text-rose-400',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
};

export default function TierProblemsPage() {
  const params = useParams();
  const router = useRouter();
  const { streak } = useGameState();

  const rawSlug = (params.languageId as string)?.toLowerCase() ?? '';
  const rawTier = (params.tier as string)?.toLowerCase() ?? '';

  const languageKey = LANGUAGE_SLUG_MAP[rawSlug] ?? null;
  const meta = TIER_META[rawTier] ?? null;

  // Determine curated problems
  const languageTracks = useMemo(() => {
    if (!rawSlug) return null;
    return CURATED_TRACKS[rawSlug] ?? null;
  }, [rawSlug]);

  const problemIds = languageTracks?.[rawTier] ?? [];
  const curatedProblems = useMemo(() =>
    PROBLEMS_DATA.filter((p) => problemIds.includes(p.id))
  , [problemIds]);

  // Load completed state from localStorage
  const storageKey = `${rawSlug}-${rawTier}-completed`;
  const [completed, setCompleted] = useState<boolean[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCompleted(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse completed state', e);
        setCompleted([]);
      }
    } else {
      setCompleted(Array(curatedProblems.length).fill(false));
    }
  }, [storageKey, curatedProblems.length]);

  // Update localStorage when completed changes
  useEffect(() => {
    if (completed.length) {
      localStorage.setItem(storageKey, JSON.stringify(completed));
    }
  }, [completed, storageKey]);

  const toggleComplete = (index: number) => {
    setCompleted((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const solvedCount = completed.filter(Boolean).length;
  const totalCount = curatedProblems.length;
  const percentage = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  if (!languageKey || !meta || totalCount === 0) {
    return (
      <div className="min-h-screen bg-bg-base text-text-main flex flex-col antialiased">
        <Navigation streakCount={streak} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md border border-border-card bg-bg-card p-8 rounded-xl shadow-sm">
            <h1 className="text-xl font-bold text-text-main mb-2">
              Track Under Preparation
            </h1>
            <p className="text-text-muted text-sm mb-6">
              This dynamic route/tier configuration is currently under preparation.
            </p>
            <Link
              href={languageKey ? `/prepare/${rawSlug}` : '/'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-main flex flex-col antialiased">
      <Navigation streakCount={streak} />

      <main className="flex-1 p-6 max-w-[1200px] w-full mx-auto flex flex-col gap-6">
        {/* Simple Header Breadcrumb */}
        <div>
          <Link
            href={`/prepare/${rawSlug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to {languageKey} Tracks
          </Link>

          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-md border font-bold uppercase tracking-wider ${meta.badgeColor}`}>
              {meta.title}
            </span>
            <h1 className="text-2xl font-bold tracking-tight">
              {languageKey} Prep Track
            </h1>
          </div>
          <p className="text-sm text-text-muted mt-1.5">{meta.subtitle}</p>
        </div>

        {/* Progress Header Card */}
        <div className="bg-bg-card border border-border-card rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-sm font-semibold text-text-main">Your Progress</span>
              <p className="text-xs text-text-muted mt-0.5">Solve all core concepts to finish the track.</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-text-main">
                {solvedCount} <span className="text-text-muted">/ {totalCount} Solved</span>
              </span>
              <span className="text-xs text-primary font-bold ml-2 font-mono">({percentage}%)</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-bg-base rounded-full overflow-hidden border border-border-card p-[1px]">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Curated Vertical List with Checkboxes */}
        <div className="flex flex-col gap-3">
          {curatedProblems.map((problem, idx) => {
            const isDone = completed[idx] ?? false;
            return (
              <div key={idx} className="flex items-center gap-4 p-4 border border-border-card rounded-xl bg-bg-card hover:border-text-muted/30 transition-all">
                {/* Left Side: Checkbox and Submission Status Badge */}
                <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggleComplete(idx)}
                    className="h-4 w-4 text-primary rounded focus:ring-primary cursor-pointer"
                  />
                  {isDone ? (
                    <span className="bg-emerald-500/10 text-emerald-400 font-mono text-xs px-2 py-1 rounded font-semibold">
                      SUBMITTED
                    </span>
                  ) : (
                    <span className="bg-zinc-800 text-zinc-400 font-mono text-xs px-2 py-1 rounded font-semibold">
                      NOT SUBMITTED
                    </span>
                  )}
                </div>

                {/* Right Side: Clickable Area covering problem details */}
                <div
                  onClick={() => router.push(`/problems/${problem.id}?lang=${rawSlug}`)}
                  className="flex-1 min-w-0 cursor-pointer hover:opacity-80 block w-full group"
                >
                  <h3 className="font-semibold text-text-main text-base group-hover:text-primary transition-colors">
                    <span className="text-text-muted font-mono mr-2">#{problem.id}</span>
                    {problem.title}
                  </h3>
                  <p className="text-sm text-text-muted mt-1 truncate max-w-2xl">{problem.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {problem.topics.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-semibold text-text-muted bg-bg-base border border-border-card px-2 py-0.5 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
