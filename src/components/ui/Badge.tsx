import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'easy' | 'medium' | 'hard' | 'accepted' | 'pending' | 'error';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const dotColors = {
    default: 'bg-text-muted opacity-50',
    easy: 'bg-[var(--color-easy)]',
    medium: 'bg-[var(--color-medium)]',
    hard: 'bg-[var(--color-hard)]',
    accepted: 'bg-[var(--color-easy)]',
    pending: 'bg-text-muted opacity-40',
    error: 'bg-[var(--color-hard)]',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted font-sans ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />
      <span>{children}</span>
    </span>
  );
}
