import type { Metadata } from 'next';
import './globals.css';
import { GameProvider } from '@/src/lib/gameState';
import ThemeWrapper from '@/src/components/ThemeWrapper';

export const metadata: Metadata = {
  title: 'CodeNode - Playful Coding Platform',
  description: 'An interactive, gamified LeetCode & HackerRank clone!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <GameProvider>
        <ThemeWrapper>
          {children}
        </ThemeWrapper>
      </GameProvider>
    </html>
  );
}
