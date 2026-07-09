import type { Metadata } from 'next';
import './globals.css';
import ThemeToggle from './ThemeToggle';

export const metadata: Metadata = {
  title: 'My Google AI Studio App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('leetcode_theme');
                if (!theme) {
                  theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                }
                document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
