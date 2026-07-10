'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/src/utils/supabaseClient';
import Navigation from '@/src/components/Navigation';
import Dashboard from '@/src/components/Dashboard';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [solvedProblemIds, setSolvedProblemIds] = useState<number[]>([1, 20]);
  const [streakCount, setStreakCount] = useState(124);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/auth/login');
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  useEffect(() => {
    const savedSolved = localStorage.getItem('leetcode_solved_ids');
    if (savedSolved) {
      try {
        setSolvedProblemIds(JSON.parse(savedSolved));
      } catch {
        /* ignore */
      }
    }
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const handleSelectProblem = (id: number) => {
    router.push(`/problems/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex flex-col antialiased">
      <Navigation streakCount={streakCount} />
      <div className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
        <Dashboard
          solvedProblemIds={solvedProblemIds}
          onSelectProblem={handleSelectProblem}
        />
      </div>
    </div>
  );
}
