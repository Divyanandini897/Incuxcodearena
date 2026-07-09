'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Globe, Loader2 } from 'lucide-react';

function ProfileSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('auth_token', token);
    }
    const name = searchParams.get('name');
    if (name) {
      setUsername(name.replace(/\s+/g, '_').toLowerCase().slice(0, 20));
    }
    const email = searchParams.get('email');
    if (email) {
      localStorage.setItem('oauth_email', email);
    }
    const url = new URL(window.location.href);
    ['token', 'provider', 'email', 'name'].forEach((p) => url.searchParams.delete(p));
    window.history.replaceState({}, '', url.pathname);
  }, [searchParams]);

  const isFormValid = username.trim().length >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);
    setError('');

    await new Promise((r) => setTimeout(r, 1500));

    localStorage.setItem('profile_setup_done', 'true');
    localStorage.setItem('auth_username', username);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-center mb-2">Set Up Your Profile</h1>
          <p className="text-[#a0a0a0] text-sm text-center mb-8">
            Just a few details before you get started
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#c0c0c0]">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  disabled={isLoading}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg py-2.5 pl-10 pr-3 text-sm text-[#f5f5f5] placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition disabled:opacity-50"
                />
              </div>
              {username.length > 0 && !isFormValid && (
                <p className="text-red-400 text-xs mt-1">Username must be at least 3 characters</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#c0c0c0]">
                Bio <span className="text-[#555]">(optional)</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-4 h-4 text-[#666]" />
                <textarea
                  placeholder="Tell us about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg py-2.5 pl-10 pr-3 text-sm text-[#f5f5f5] placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition disabled:opacity-50 resize-none"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-[#2a2a2a] disabled:text-[#555] text-black font-semibold text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isLoading ? 'Saving...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    }>
      <ProfileSetupContent />
    </Suspense>
  );
}
