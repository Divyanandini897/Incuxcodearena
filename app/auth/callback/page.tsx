'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/src/utils/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!profile) {
        const email = session.user.email || '';
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0];
        const avatarUrl = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '';

        await fetch('/api/auth/handle-oauth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            email,
            name,
            avatarUrl,
          }),
        });
      }

      router.replace('/');
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
    </div>
  );
}
