'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, Loader2, Check, X } from 'lucide-react';
import { getPasswordChecks, isStrongPassword } from '@/src/lib/password-validator';
import { supabase } from '@/src/utils/supabaseClient';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [showOtpSent, setShowOtpSent] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);
  const doPasswordsMatch = password === confirmPassword;
  const isNameValid = name.trim().length >= 2;
  const passwordChecks = getPasswordChecks(password);
  const isPasswordStrong = isStrongPassword(password);
  const isFormValid = isNameValid && isEmailValid && isPasswordStrong && doPasswordsMatch;

  if (showOtpSent) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
            <p className="text-sm text-[#a0a0a0] mb-6">
              We&apos;ve sent a 6-digit verification code to{' '}
              <span className="text-[#f5f5f5] font-semibold">{email}</span>
            </p>
            <button
              onClick={() => router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm py-2.5 rounded-lg transition cursor-pointer"
            >
              Enter Verification Code
            </button>
            <p className="text-center text-sm text-[#666] mt-4">
              <button
                onClick={() => { setShowOtpSent(false); setError(''); }}
                className="text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
              >
                Use a different email
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setIsLoading(false);
        return;
      }
      setShowOtpSent(true);
      setIsLoading(false);
    } catch {
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) {
      setError(authError.message);
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) {
      setError(authError.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-[#a0a0a0] text-sm text-center mb-8">
            Start your coding journey today
          </p>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg py-2 mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#c0c0c0]">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                  disabled={isLoading}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg py-2.5 pl-10 pr-3 text-sm text-[#f5f5f5] placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition disabled:opacity-50"
                />
              </div>
              {touched.name && !isNameValid && name.length > 0 && (
                <p className="text-red-400 text-xs mt-1">Name must be at least 2 characters</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#c0c0c0]">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  disabled={isLoading}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg py-2.5 pl-10 pr-3 text-sm text-[#f5f5f5] placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition disabled:opacity-50"
                />
              </div>
              {touched.email && !isEmailValid && email.length > 0 && (
                <p className="text-red-400 text-xs mt-1">Please enter a valid email address</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#c0c0c0]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                  disabled={isLoading}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg py-2.5 pl-10 pr-10 text-sm text-[#f5f5f5] placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#f5f5f5] transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {passwordChecks.map((check) => (
                    <div key={check.label} className="flex items-center gap-1.5 text-xs">
                      {check.met ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <X className="w-3 h-3 text-red-400" />
                      )}
                      <span className={check.met ? 'text-emerald-400' : 'text-[#777]'}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#c0c0c0]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
                  disabled={isLoading}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg py-2.5 pl-10 pr-10 text-sm text-[#f5f5f5] placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#f5f5f5] transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {touched.confirmPassword && confirmPassword.length > 0 && !doPasswordsMatch && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-[#2a2a2a] disabled:text-[#555] text-black font-semibold text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#1e1e1e]" />
            <span className="text-xs text-[#555]">OR</span>
            <div className="flex-1 h-px bg-[#1e1e1e]" />
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-[#f5f5f5] text-sm py-2.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-[#f5f5f5] text-sm py-2.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>
          </div>

          <p className="text-center text-sm text-[#666] mt-6">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-emerald-400 hover:text-emerald-300 transition font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
