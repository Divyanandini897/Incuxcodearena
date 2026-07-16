'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Code, Brain, Swords, Star, ArrowRight, Zap, Menu, X } from 'lucide-react';
import { Waves } from '@/src/components/ui/wave-background';

const features = [
  {
    icon: Code,
    title: 'Coding Challenges',
    description: '500+ problems across Python, C++, Java, Go and JavaScript with Judge0-powered code execution and comprehensive test cases.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Feedback',
    description: 'Context-aware hints and solution analysis help you debug faster and understand optimal approaches.',
  },
  {
    icon: Swords,
    title: 'Live Contests',
    description: 'Time-based competitions with real-time leaderboards, automated scoring, and contest-specific problem sets.',
  },
  {
    icon: Zap,
    title: 'Track Progress',
    description: 'Detailed analytics, streak tracking, solved-problem history, and performance metrics across all languages.',
  },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-text-main font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-[var(--color-bg-nav)] backdrop-blur-md border-b border-border-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <img src="/incux_logo.jpg" alt="IncuxAI" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-bold text-lg tracking-tight">Incux<span className="text-primary">AI</span></span>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/auth/login">
                <span className="px-4 py-2 text-sm text-text-muted hover:text-white transition-colors cursor-pointer">Log in</span>
              </Link>
              <Link href="/auth/register">
                <span className="px-5 py-2 text-sm font-medium bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">Get Started</span>
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-muted hover:text-white hover:bg-hover"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-card/50 bg-zinc-900">
            <div className="px-4 py-4 flex flex-col gap-3">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <span className="block w-full text-center px-4 py-2 text-sm rounded-lg border border-border-card/50 hover:bg-zinc-800 transition-colors">Log in</span>
              </Link>
              <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                <span className="block w-full text-center px-4 py-2 text-sm font-medium bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors">Get Started</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-black">
        <Waves
          className="z-0"
          strokeColor="#00EA64"
          backgroundColor="#000000"
          pointerSize={0.6}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 relative z-30 w-full">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8">
              <Star className="w-3.5 h-3.5 fill-primary" />
              AI-Powered Coding Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-[1.1] mb-6 text-white">
              Master Coding with{' '}
              <span className="text-primary">AI-Powered</span>{' '}
              Practice
            </h1>

            <p className="text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Incux Code Arena is a full-stack coding platform with 500+ problems, AI-driven hints,
              live contests, and detailed progress tracking across five programming languages.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <span className="inline-flex items-center gap-2 px-8 py-3 text-base font-medium bg-primary text-black rounded-lg hover:bg-primary/90 transition-all cursor-pointer">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <Link href="/auth/login">
                <span className="inline-flex items-center gap-2 px-8 py-3 text-base font-medium border border-zinc-600 text-white rounded-lg hover:bg-zinc-800 transition-all cursor-pointer">
                  Log In
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mb-4 text-white">
              Everything you need to level up
            </h2>
            <p className="text-neutral-400 text-lg max-w-xl mx-auto">
              Practice coding challenges, get AI-powered suggestions, compete in real-time contests,
              and monitor your growth — all from a single platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-zinc-800/40 bg-zinc-900 p-6 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-zinc-800/40 bg-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mb-4 text-white">
            Ready to start coding?
          </h2>
          <p className="text-neutral-400 text-lg mb-8">
            Join developers practicing and competing on Incux Code Arena.
          </p>
          <Link href="/auth/register">
            <span className="inline-flex items-center gap-2 px-10 py-3 text-base font-medium bg-primary text-black rounded-lg hover:bg-primary/90 transition-all cursor-pointer">
              Create Your Free Account
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/40 py-8 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Code className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-white">Incux<span className="text-primary">AI</span></span>
          </div>
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} IncuxAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
