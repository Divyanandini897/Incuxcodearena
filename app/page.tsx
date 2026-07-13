'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/src/utils/supabaseClient';
import Navigation from '@/src/components/Navigation';
import Dashboard from '@/src/components/Dashboard';

interface UserProfile {
  name: string | null;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  provider: string | null;
}

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [solvedProblemIds, setSolvedProblemIds] = useState<number[]>([1, 20]);
  const [streakCount, setStreakCount] = useState(124);

  useEffect(() => {
    if (window.location.search.includes('signout')) {
      supabase.auth.signOut();
      router.replace('/auth/login');
      return;
    }
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/auth/login');
          return;
        }
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user || !user.email) {
          await supabase.auth.signOut();
          router.replace('/auth/login');
          return;
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email, username, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        if (profile) {
          setUserProfile({
            ...profile,
            provider: user.app_metadata?.provider || 'email',
          } as UserProfile);
        }
      } catch {
        router.replace('/auth/login');
        return;
      }
      setChecking(false);
    };
    init();
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
          userProfile={userProfile}
          solvedProblemIds={solvedProblemIds}
          onSelectProblem={handleSelectProblem}
        />
      </div>
    </div>
  );
}
