'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/utils/supabaseClient';
import { useGameState } from '@/src/lib/gameState';
import Dashboard from '@/src/components/Dashboard';
import AppLayout from '@/src/components/AppLayout';

interface UserProfile {
  name: string | null;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  provider: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { solvedIds } = useGameState();
  const [checking, setChecking] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          router.replace('/auth/login');
          return;
        }

        const user = session.user;
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
            name: user.user_metadata?.full_name || null,
            email: user.email || null,
            username: null,
            avatar_url: user.user_metadata?.avatar_url || null,
            provider: user.app_metadata?.provider || 'email',
          });
        }
      } catch (err) {
        console.error('Error checking session:', err);
        router.replace('/auth/login');
      } finally {
        setChecking(false);
      }
    };

    checkUser();
  }, [router]);

  const handleSelectProblem = (id: number) => {
    router.push(`/problems/${id}`);
  };

  if (checking) {
    return (
      <AppLayout>
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Dashboard
        userProfile={userProfile}
        solvedProblemIds={solvedIds || []}
        onSelectProblem={handleSelectProblem}
      />
    </AppLayout>
  );
}
