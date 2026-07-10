import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-[#121212] rounded-xl border border-[#1e1e1e] p-4 ${className}`}>
      {children}
    </div>
  );
}
