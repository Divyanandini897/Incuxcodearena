// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { Mail, ArrowLeft, Loader2 } from 'lucide-react';

// export default function ForgotPasswordPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [sent, setSent] = useState(false);
//   const [error, setError] = useState('');

//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   const isEmailValid = emailRegex.test(email);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!isEmailValid) return;
//     setIsLoading(true);
//     setError('');

//     try {
//       const res = await fetch('/api/auth/send-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, type: 'reset' }),
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         setError(data.error || 'Failed to send reset code');
//         setIsLoading(false);
//         return;
//       }

//       localStorage.setItem('pending_email', email);
//       setSent(true);
//       setIsLoading(false);
//     } catch {
//       setError('Network error. Please try again.');
//       setIsLoading(false);
//     }
//   };

//   if (sent) {
//     return (
//       <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center p-4">
//         <div className="w-full max-w-md">
//           <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-8 shadow-2xl text-center">
//             <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Mail className="w-8 h-8 text-emerald-400" />
//             </div>
//             <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
//             <p className="text-sm text-[#a0a0a0] mb-6">
//               We&apos;ve sent a password reset code to{' '}
//               <span className="text-[#f5f5f5] font-semibold">{email}</span>
//             </p>
//             <button
//               onClick={() => {
//                 localStorage.setItem('pending_email', email);
//                 router.push(`/auth/verify-otp?type=reset&email=${encodeURIComponent(email)}`);
//               }}
//               className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm py-2.5 rounded-lg transition cursor-pointer"
//             >
//               Enter Reset Code
//             </button>
//             <p className="text-center text-sm text-[#666] mt-4">
//               <button
//                 onClick={() => { setSent(false); setIsLoading(false); }}
//                 className="text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
//               >
//                 Use a different email
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-8 shadow-2xl">
//           <Link
//             href="/auth/login"
//             className="inline-flex items-center gap-1.5 text-sm text-[#666] hover:text-[#f5f5f5] transition mb-6"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back to Login
//           </Link>

//           <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
//           <p className="text-[#a0a0a0] text-sm mb-8">
//             Enter your email and we&apos;ll send you a code to reset your password.
//           </p>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium mb-1.5 text-[#c0c0c0]">
//                 Email
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
//                 <input
//                   type="email"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={(e) => {
//                     setEmail(e.target.value);
//                     setError('');
//                   }}
//                   disabled={isLoading}
//                   className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg py-2.5 pl-10 pr-3 text-sm text-[#f5f5f5] placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition disabled:opacity-50"
//                 />
//               </div>
//               {email.length > 0 && !isEmailValid && (
//                 <p className="text-red-400 text-xs mt-1">Please enter a valid email address</p>
//               )}
//             </div>

//             {error && (
//               <p className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg py-2">
//                 {error}
//               </p>
//             )}

//             <button
//               type="submit"
//               disabled={!isEmailValid || isLoading}
//               className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-[#2a2a2a] disabled:text-[#555] text-black font-semibold text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:cursor-not-allowed cursor-pointer"
//             >
//               {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
//               {isLoading ? 'Sending...' : 'Send Reset Code'}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }




// updating

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'reset' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send reset code');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('pending_email', email);
      
      // Instantly direct them to the page where they can enter the code
      router.push(`/auth/verify-otp?type=reset&email=${encodeURIComponent(email)}`);
    } catch {
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-8 shadow-2xl">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-[#666] hover:text-[#f5f5f5] transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
          <p className="text-[#a0a0a0] text-sm mb-8">
            Enter your email and we&apos;ll send you a code to reset your password.
          </p>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg py-2 mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#c0c0c0]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  disabled={isLoading}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg py-2.5 pl-10 pr-3 text-sm text-[#f5f5f5] placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50 transition disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isEmailValid || isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-[#2a2a2a] disabled:text-[#555] text-black font-semibold text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Code'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}