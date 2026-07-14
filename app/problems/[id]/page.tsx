'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Workspace from '@/src/components/Workspace';
import { PROBLEMS_DATA } from '@/src/data/data';
import { useGameState } from '@/src/lib/gameState';
import { supabase } from '@/src/utils/supabaseClient';

export default function ProblemPage() {
  const params = useParams();
  const router = useRouter();
  const problemId = Number(params.id);
  const [solvedProblemIds, setSolvedProblemIds] = useState<number[]>([1, 20]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
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
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex flex-col antialiased">
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
