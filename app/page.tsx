'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRouter } from 'next/navigation';
import Navigation from '@/src/components/Navigation';
import Dashboard from '@/src/components/Dashboard';
import { useGameState } from '@/src/lib/gameState';

export default function HomePage() {
  const router = useRouter();
  const { solvedIds, streak } = useGameState();

  const handleSelectProblem = (id: number) => {
    router.push(`/problems/${id}`);
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-main flex flex-col antialiased">
      <Navigation streakCount={streak} />
      <div className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
        <Dashboard
          solvedProblemIds={solvedIds}
          onSelectProblem={handleSelectProblem}
        />
      </div>
    </div>
  );
}
