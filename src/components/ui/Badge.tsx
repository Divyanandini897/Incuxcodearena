import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'easy' | 'medium' | 'hard' | 'accepted' | 'pending' | 'error';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-[#1e1e1e] text-[#a0a0a0] border-[#2e2e2e]',
    easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    hard: 'bg-red-500/10 text-red-400 border-red-500/20',
    accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
