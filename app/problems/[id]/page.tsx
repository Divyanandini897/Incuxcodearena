'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Workspace from '@/src/components/Workspace';
import { PROBLEMS_DATA } from '@/src/data/data';
import { useGameState } from '@/src/lib/gameState';
import { supabase } from '@/src/utils/supabaseClient';
import { saveProgressToDb } from '@/src/utils/progressSync';

export default function ProblemPage() {
  const params = useParams();
  const router = useRouter();
  const problemId = Number(params.id);
  const { streak } = useGameState();
  const [solvedProblemIds, setSolvedProblemIds] = useState<number[]>([1, 20]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get authenticated user ID for DB writes.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });

    const savedSolved = localStorage.getItem('leetcode_solved_ids');
    if (savedSolved) {
      try {
        setSolvedProblemIds(JSON.parse(savedSolved));
      } catch (err) {
        console.error('Error loading solved IDs:', err);
      }
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
        localStorage.setItem('codenode_profile_id', session.user.id);
      } else {
        const stored = localStorage.getItem('codenode_profile_id');
        if (stored) setUserId(stored);
      }
    });
  }, []);

  const handleMarkSolved = (id: number) => {
    setSolvedProblemIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem('leetcode_solved_ids', JSON.stringify(updated));
      // Persist to Supabase so progress survives sign-out / new devices.
      if (userId) {
        saveProgressToDb(supabase, userId, updated, streak);
      }
      return updated;
    });
  };

  return (
    <div className="h-screen bg-bg-base text-text-main flex flex-col antialiased">
      <Workspace
        problemId={problemId}
        problems={PROBLEMS_DATA}
        solvedProblemIds={solvedProblemIds}
        onBackToDashboard={() => router.push('/')}
        onMarkSolved={handleMarkSolved}
        userId={userId}
      />
    </div>
  );
}
