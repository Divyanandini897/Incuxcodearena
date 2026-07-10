import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-emerald-500 text-black hover:bg-emerald-400',
    secondary: 'bg-[#1e1e1e] text-[#f5f5f5] border border-[#2e2e2e] hover:bg-[#2a2a2a]',
    ghost: 'text-[#a0a0a0] hover:text-[#f5f5f5] hover:bg-[#1e1e1e]/40',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-xs px-3.5 py-2',
    lg: 'text-sm px-5 py-2.5',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
