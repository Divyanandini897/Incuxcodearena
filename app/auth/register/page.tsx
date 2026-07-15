'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react';

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
  const [emailExists, setEmailExists] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);
  const doPasswordsMatch = password === confirmPassword;
  
  // Form is valid if name is at least 2 chars, email is valid, password is at least 6 chars, and they match
  const isFormValid = name.trim().length >= 2 && isEmailValid && password.length >= 6 && doPasswordsMatch;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);
    setError('');
    setEmailExists(false);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        const errorMsg = data.error || 'Registration failed';
        setError(errorMsg);
        
        // Check if the error message indicates the user already exists
        if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('exist')) {
          setEmailExists(true);
        }
        
        setIsLoading(false);
        return;
      }
      
      localStorage.setItem('pending_email', email);
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
    } catch {
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-[#a0a0a0] text-sm text-center mb-8">Start your coding journey today</p>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg py-3 mb-4 px-3 flex flex-col gap-1 items-center justify-center">
              <span>{error}</span>
              {emailExists && (
                <Link 
                  href="/auth/login" 
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline text-xs mt-1 transition"
                >
                  Click here to Sign In instead →
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#c0c0c0]">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); setEmailExists(false); }}
                  disabled={isLoading}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg py-2.5 pl-10 pr-3 text-sm text-[#f5f5f5] placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50 transition disabled:opacity-50"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#c0c0c0]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); setEmailExists(false); }}
                  disabled={isLoading}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg py-2.5 pl-10 pr-3 text-sm text-[#f5f5f5] placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50 transition disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#c0c0c0]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  disabled={isLoading}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg py-2.5 pl-10 pr-10 text-sm text-[#f5f5f5] placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50 transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#f5f5f5] transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#c0c0c0]">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  disabled={isLoading}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg py-2.5 pl-10 pr-10 text-sm text-[#f5f5f5] placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50 transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#f5f5f5] transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && !doPasswordsMatch && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-[#2a2a2a] disabled:text-[#555] text-black font-semibold text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#666] mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 transition font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}