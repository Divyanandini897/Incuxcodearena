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
  const { solvedIds, streak } = useGameState();

  const [checking, setChecking] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [solvedProblemIds, setSolvedProblemIds] = useState<number[]>([]);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Sync local state with your game context state
    setStreakCount(streak || 0);
    setSolvedProblemIds(solvedIds || []);

    const checkUserAndFetchProfile = async () => {
      try {
        // 1. Sign-out route: clear all browser state then redirect
        if (typeof window !== 'undefined' && window.location.search.includes('signout')) {
          // Clear all Supabase and game-state localStorage keys
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('sb-') || key === 'codenode_game_state_v1' || key === 'leetcode_solved_ids')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => localStorage.removeItem(key));

          // Clear Supabase sb-* cookies
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

        // 2. Fetch the active user session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          router.replace('/auth/login');
          return;
        }

        const user = session.user;
        const email = user.email || '';

        // Store email + profile id so layouts/children can read synchronously
        localStorage.setItem('codenode_user_email', email);
        localStorage.setItem('codenode_user_name', user.user_metadata?.full_name || email.split('@')[0]);
        localStorage.setItem('codenode_profile_id', user.id);

        // Sync profile to DB for ALL users (required for contests, submissions, etc.)
        const syncName = user.user_metadata?.full_name || email.split('@')[0];
        try {
          const syncRes = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, email, name: syncName, avatar_url: user.user_metadata?.avatar_url || null }),
          });
          if (!syncRes.ok) {
            const syncErr = await syncRes.json().catch(() => ({ error: 'Unknown' }));
            console.error('[page] Profile sync failed:', syncErr);
          }
        } catch (syncErr) {
          console.error('[page] Profile sync error:', syncErr);
        }

        // 3. Check if admin — redirect to admin panel
        if (email === 'deepika.tiwari.1408@gmail.com') {
          setIsAdmin(true);
          router.replace('/admin/contests');
          return;
        }

        // 4. Fetch the profile from DB (should exist now after sync)
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email, username, avatar_url')
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
        } else {
          setUserProfile({
            name: syncName,
            email: email,
            username: null,
            avatar_url: user.user_metadata?.avatar_url || null,
            provider: user.app_metadata?.provider || 'email',
          });
        }
      } catch (error) {
        console.error('Error verifying profile login state:', error);
        router.replace('/auth/login');
      } finally {
        setChecking(false);
      }
    };

    checkUserAndFetchProfile();
  }, [router, solvedIds, streak]);

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
          {/* Added userProfile prop back here so Dashboard receives the user details */}
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