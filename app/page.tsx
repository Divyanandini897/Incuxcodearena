'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/src/utils/supabaseClient';
import Navigation from '@/src/components/Navigation';
import Dashboard from '@/src/components/Dashboard';
import { useGameState } from '@/src/lib/gameState';
import AppLayout from '@/src/components/AppLayout';

interface UserProfile {
  name: string | null;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  provider: string | null;
}

export default function HomePage() {
  const router = useRouter();
  const { solvedIds, streak, hydrate } = useGameState();

  const [checking, setChecking] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [solvedProblemIds, setSolvedProblemIds] = useState<number[]>([]);
  const [streakCount, setStreakCount] = useState<number>(0);

  // Hook 1: Check auth session and fetch user profile + DB progress on login.
  useEffect(() => {
    const checkUserAndFetchProfile = async () => {
      try {
        // Sign-out route: clear Supabase session keys then redirect.
        // Progress keys (codenode_game_state_v1, leetcode_solved_ids) are
        // intentionally preserved — they are local caches, not session tokens.
        if (typeof window !== 'undefined' && window.location.search.includes('signout')) {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sb-')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => localStorage.removeItem(key));

          document.cookie.split(';').forEach((c) => {
            const cookieName = c.trim().split('=')[0];
            if (cookieName.startsWith('sb-')) {
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            }
          });

          sessionStorage.clear();
          await supabase.auth.signOut();
          router.replace('/auth/login');
          return;
        }

        // Fetch the active user session.
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          router.replace('/auth/login');
          return;
        }

        const user = session.user;

        // Fetch profile + saved game progress from Supabase.
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email, username, avatar_url, solved_problems, streak')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setUserProfile({
            name: profile.name,
            email: profile.email,
            username: profile.username,
            avatar_url: profile.avatar_url,
            provider: user.app_metadata?.provider || 'email',
          });
          // Restore progress from DB into the game state provider.
          hydrate(
            Array.isArray(profile.solved_problems) ? profile.solved_problems : [],
            typeof profile.streak === 'number' ? profile.streak : 0,
            user.id
          );
        } else {
          setUserProfile({
            name: user.user_metadata?.full_name || null,
            email: user.email || null,
            username: null,
            avatar_url: user.user_metadata?.avatar_url || null,
            provider: user.app_metadata?.provider || 'email',
          });
          // No profile row yet — still mark the user ID so progress is saved going forward.
          hydrate([], 0, user.id);
        }
        setChecking(false);
      } catch (error) {
        console.error('Error verifying profile login state:', error);
        router.replace('/auth/login');
      }
    };

    checkUserAndFetchProfile();
  }, [router]); // auth check runs once on mount

  // Hook 2: Keep local UI state in sync with the game context (e.g. after a problem is solved).
  useEffect(() => {
    setStreakCount(streak || 0);
    setSolvedProblemIds(solvedIds || []);
  }, [solvedIds, streak]);

  const handleSelectProblem = (id: number) => {
    router.push(`/problems/${id}`);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex flex-col antialiased">
      <Navigation streakCount={streakCount} userProfile={userProfile} />
      <AppLayout>
        <div className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
          <Dashboard
            userProfile={userProfile}
            solvedProblemIds={solvedProblemIds}
            onSelectProblem={handleSelectProblem}
          />
        </div>
      </AppLayout>
    </div>
  );
}