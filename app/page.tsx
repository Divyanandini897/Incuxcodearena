'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRouter } from 'next/navigation';
import Dashboard from '@/src/components/Dashboard';
import { useGameState } from '@/src/lib/gameState';
import AppLayout from '@/src/components/AppLayout';

export default function HomePage() {
  const router = useRouter();
  const { solvedIds } = useGameState();

  const handleSelectProblem = (id: number) => {
    router.push(`/problems/${id}`);
  };

  return (
    <AppLayout>
      <Dashboard
        solvedProblemIds={solvedIds}
        onSelectProblem={handleSelectProblem}
      />
    </AppLayout>
  );
}
