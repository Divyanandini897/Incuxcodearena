'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/src/components/Navigation';
import Dashboard from '@/src/components/Dashboard';

export default function HomePage() {
  const router = useRouter();
  const [solvedProblemIds, setSolvedProblemIds] = useState<number[]>([1, 20]);
  const [streakCount, setStreakCount] = useState(124);

  useEffect(() => {
    const savedSolved = localStorage.getItem('leetcode_solved_ids');
    if (savedSolved) {
      try {
        setSolvedProblemIds(JSON.parse(savedSolved));
      } catch (err) {
        console.error('Error loading solved IDs:', err);
      }
    }
  }, []);

  const handleSelectProblem = (id: number) => {
    router.push(`/problems/${id}`);
  };

  return (
    <div className="min-h-screen bg-page text-primary flex flex-col antialiased">
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
