import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-[10px] transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow active:scale-[0.99]',
    secondary: 'bg-elevated text-text-main border border-border-card/40 hover:bg-hover hover:-translate-y-[1px] hover:shadow-xs active:scale-[0.99] active:translate-y-0',
    ghost: 'text-text-muted hover:text-text-main hover:bg-hover active:scale-[0.99]',
  };

  const sizes = {
    sm: 'text-[11px] px-3 py-1.5',
    md: 'text-xs px-4 py-2',
    lg: 'text-sm px-6 py-2.5',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
