import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-bg-card border border-border-card rounded-xl p-6 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
}
