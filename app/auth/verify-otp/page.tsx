'use client';

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'signup';
  const emailParam = searchParams.get('email') || '';
  const email = emailParam || (typeof window !== 'undefined' ? localStorage.getItem('pending_email') || '' : '');

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) router.replace('/auth/register');
  }, [email, router]);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, canResend]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const isComplete = otp.every((d) => d !== '');

  const handleVerify = async () => {
    if (!isComplete) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join(''), type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Incorrect code, please try again');
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
        setIsLoading(false);
        return;
      }

      if (type === 'signup') {
        localStorage.removeItem('pending_email');
        router.push('/auth/login?verified=true');
      } else if (type === 'reset') {
        router.push('/auth/reset-password');
      }
    } catch {
      setError('Network error. Please try again.');
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
      setIsLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(30);
    setOtp(Array(6).fill(''));
    setError('');
    inputRefs.current[0]?.focus();

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to resend code');
        setCanResend(true);
        setTimer(0);
      }
    } catch {
      setError('Network error. Please try again.');
      setCanResend(true);
      setTimer(0);
    }
  }, [canResend, email, type]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-8 shadow-2xl">
          <Link
            href={type === 'reset' ? '/auth/forgot-password' : '/auth/register'}
            className="inline-flex items-center gap-1.5 text-sm text-[#666] hover:text-[#f5f5f5] transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
          <p className="text-sm text-[#a0a0a0] mb-2">
            We&apos;ve sent a 6-digit code to{' '}
            <span className="text-[#f5f5f5] font-semibold">{email}</span>
          </p>

          <div className="flex items-center justify-center gap-2.5 my-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isLoading}
                className="w-12 h-14 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-center text-lg font-bold text-[#f5f5f5] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition disabled:opacity-50"
              />
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg py-2 mb-4">
              {error}
            </p>
          )}

          <button
            onClick={handleVerify}
            disabled={!isComplete || isLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-[#2a2a2a] disabled:text-[#555] text-black font-semibold text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>

          <p className="text-center text-sm text-[#666] mt-6">
            Didn&apos;t receive the code?{' '}
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-emerald-400 hover:text-emerald-300 transition font-medium cursor-pointer"
              >
                Resend
              </button>
            ) : (
              <span className="text-[#555]">
                Resend in {formatTime(timer)}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
