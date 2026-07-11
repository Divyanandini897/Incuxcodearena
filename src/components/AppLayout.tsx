'use client';

import React, { useState } from 'react';
import LeftSidebar from './LeftSidebar';
import TopNavbar from './TopNavbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base text-text-main flex font-sans antialiased select-none">
      
      {/* 1. Left Sidebar Navigation */}
      <LeftSidebar 
        isMobileOpen={isMobileOpen} 
        onMobileClose={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* 2. Main Page Column */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Sticky Top Bar */}
        <TopNavbar onMobileMenuOpen={() => setIsMobileOpen(true)} />

        {/* Content Container */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8 relative z-10">
          {children}
        </main>
      </div>

    </div>
  );
}
