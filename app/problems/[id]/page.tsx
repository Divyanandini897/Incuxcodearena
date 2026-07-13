'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useParams, useRouter } from 'next/navigation';
import Workspace from '@/src/components/Workspace';
import { PROBLEMS_DATA } from '@/src/data/data';
import { useGameState } from '@/src/lib/gameState';

export default function ProblemPage() {
  const params = useParams();
  const router = useRouter();
  const problemId = Number(params.id);
  const { solvedIds, solveProblem } = useGameState();

  const problem = PROBLEMS_DATA.find((p) => p.id === problemId);

  const handleMarkSolved = (id: number) => {
    if (problem) {
      solveProblem(id, problem.difficulty);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-main flex flex-col antialiased">
      <Workspace
        problemId={problemId}
        problems={PROBLEMS_DATA}
        solvedProblemIds={solvedIds}
        onBackToDashboard={() => router.push('/')}
        onMarkSolved={handleMarkSolved}
      />
    </div>
  );
}
