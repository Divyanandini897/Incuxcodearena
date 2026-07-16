'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Github, X, ExternalLink, ArrowRight } from 'lucide-react';
import { supabase } from '@/src/utils/supabaseClient';

type ViewState = 'loading' | 'confirm' | 'switch' | 'redirecting' | 'error';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [view, setView] = useState<ViewState>('loading');
  const [sessionData, setSessionData] = useState<any>(null);
  const [profileData, setProfileData] = useState<{
    email: string;
    name: string;
    userName: string;
    avatarUrl: string;
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const oauthError = searchParams.get('error');
      if (oauthError) {
        const desc = searchParams.get('error_description') || oauthError;
        if (!cancelled) {
          setError(decodeURIComponent(desc.replace(/\+/g, ' ')));
          setView('error');
        }
        return;
      }

      let session = null;
      for (let i = 0; i < 5; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          session = data.session;
          break;
        }
        if (i < 4) await new Promise((r) => setTimeout(r, 500));
      }

      if (!session) {
        if (!cancelled) {
          setError('Authentication failed. Please try again.');
          setView('error');
        }
        return;
      }

      const email = session.user.email || '';
      const provider = session.user.app_metadata?.provider || 'email';
      const name =
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        email.split('@')[0];
      const userName =
        session.user.user_metadata?.user_name ||
        session.user.user_metadata?.preferred_username ||
        email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');
      const avatarUrl =
        session.user.user_metadata?.avatar_url ||
        session.user.user_metadata?.picture ||
        '';

      if (cancelled) return;

      if (provider === 'github') {
        setSessionData(session);
        setProfileData({ email, name, userName, avatarUrl });
        setView('confirm');
      } else {
        setView('redirecting');
        const res = await fetch('/api/auth/handle-oauth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            email,
            name,
            username: userName,
            avatarUrl,
          }),
        });
        if (res.ok) {
          router.replace('/practice-arena');
        } else {
          router.replace('/auth/login?oauth_error=Profile_creation_failed');
        }
      }
    };

    init();
    return () => { cancelled = true; };
  }, [router]);

  const upsertAndGo = async () => {
    if (!sessionData || !profileData) return;
    setView('redirecting');

    const res = await fetch('/api/auth/handle-oauth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: sessionData.user.id,
        email: profileData.email,
        name: profileData.name,
        username: profileData.userName,
        avatarUrl: profileData.avatarUrl,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      router.replace(
        `/auth/login?oauth_error=${encodeURIComponent(
          errData.error || 'Profile creation failed'
        )}`
      );
      return;
    }

    router.replace('/practice-arena');
  };

  const clearSupabaseSession = async () => {
    await supabase.auth.signOut();

    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const name = c.trim().split('=')[0];
      if (name.startsWith('sb-')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      }
    }

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    }
  };

  const restartOAuth = async () => {
    setView('redirecting');
    await clearSupabaseSession();

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setView('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center p-4">
      {/* Loading spinner */}
      {view === 'loading' && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          <p className="text-sm text-[#a0a0a0]">Verifying your login...</p>
        </div>
      )}

      {/* Redirecting spinner */}
      {view === 'redirecting' && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          <p className="text-sm text-[#a0a0a0]">Setting up your dashboard...</p>
        </div>
      )}

      {/* Error dialog */}
      {view === 'error' && (
        <div className="w-full max-w-md bg-[#111111] border border-[#1e1e1e] rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Authentication Error</h2>
          <p className="text-sm text-[#a0a0a0] mb-6">{error}</p>
          <button
            onClick={() => router.replace('/auth/login')}
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm py-2.5 px-6 rounded-lg transition cursor-pointer"
          >
            Back to Login
          </button>
        </div>
      )}

      {/* Dialog 1: GitHub account confirmation */}
      {view === 'confirm' && profileData && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#111111] border border-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1a1a1a] to-[#111111] px-6 py-5 border-b border-[#1e1e1e]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] flex items-center justify-center">
                    <Github className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Continue with GitHub</h2>
                    <p className="text-[10px] text-[#666]">Confirm your account</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className="text-xs text-[#a0a0a0] mb-4">
                  GitHub has already authenticated the following account:
                </p>

                <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl p-4 flex items-center gap-4">
                  {profileData.avatarUrl ? (
                    <img
                      src={profileData.avatarUrl}
                      alt={profileData.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-base font-bold shrink-0">
                      {(profileData.name || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">
                      {profileData.name}
                    </p>
                    {profileData.userName && (
                      <p className="text-xs text-[#a0a0a0] font-mono">
                        @{profileData.userName}
                      </p>
                    )}
                    {profileData.email && (
                      <p className="text-[11px] text-[#666] truncate mt-0.5">
                        {profileData.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-5 space-y-2.5">
                <button
                  onClick={upsertAndGo}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  Continue as @{profileData.userName || profileData.name}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setView('switch')}
                  className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-[#f5f5f5] text-sm py-2.5 rounded-lg transition cursor-pointer"
                >
                  Use another GitHub account
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Dialog 2: Switch GitHub account instructions */}
      {view === 'switch' && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#111111] border border-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1a1a1a] to-[#111111] px-6 py-5 border-b border-[#1e1e1e]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] flex items-center justify-center">
                    <Github className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Switch GitHub Account</h2>
                    <p className="text-[10px] text-[#666]">Use a different account</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-xs text-amber-300/90 leading-relaxed">
                    GitHub is currently signed in using your browser. Unlike
                    Google, GitHub does not provide an account chooser dialog.
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#a0a0a0] font-medium mb-2">
                    To continue with another GitHub account:
                  </p>
                  <ul className="space-y-2">
                    {[
                      'Sign out of GitHub in this browser, then sign in with a different account.',
                      'Open the login flow in an Incognito / Private browsing window.',
                      'Use a different browser profile (Firefox Container, Chrome Profile).',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#777]">
                        <span className="w-4 h-4 rounded-full bg-[#1e1e1e] flex items-center justify-center text-[10px] text-[#555] shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-5 space-y-2.5">
                <button
                  onClick={() => window.open('https://github.com/logout', '_blank')}
                  className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-[#f5f5f5] text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Sign out of GitHub
                </button>

                <button
                  onClick={restartOAuth}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm py-2.5 rounded-lg transition cursor-pointer"
                >
                  I&apos;ve signed out
                </button>

                <button
                  onClick={() => setView('confirm')}
                  className="w-full bg-transparent text-[#a0a0a0] hover:text-[#f5f5f5] text-sm py-2 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
