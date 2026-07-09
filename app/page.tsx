'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Navigation from '@/src/components/Navigation';
import Dashboard from '@/src/components/Dashboard';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);
  const [solvedProblemIds, setSolvedProblemIds] = useState<number[]>([1, 20]);
  const [streakCount, setStreakCount] = useState(124);

  useEffect(() => {
    const oauthToken = searchParams.get('token');
    const provider = searchParams.get('provider');

    if (oauthToken && provider) {
      localStorage.setItem('auth_token', oauthToken);
      const email = searchParams.get('email') || '';
      const name = searchParams.get('name') || '';
      if (email) localStorage.setItem('oauth_email', email);
      if (name) localStorage.setItem('oauth_name', name);
      const url = new URL(window.location.href);
      ['token', 'provider', 'email', 'name'].forEach((p) => url.searchParams.delete(p));
      window.history.replaceState({}, '', url.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.replace('/auth/login');
    } else {
      setChecking(false);
    }
  }, [router]);

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

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
