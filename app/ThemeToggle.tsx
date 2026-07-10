'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const theme = document.documentElement.getAttribute('data-theme');
    setIsLight(theme === 'light');
  }, []);

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.setAttribute('data-theme', next ? 'light' : 'dark');
    localStorage.setItem('leetcode_theme', next ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-3 right-3 z-50 p-2 rounded-full bg-elevated/80 backdrop-blur-sm border border-border text-secondary hover:text-primary hover:bg-elevated transition-all cursor-pointer shadow-lg"
      title={isLight ? 'Switch to Dark' : 'Switch to Light'}
    >
      {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
}
