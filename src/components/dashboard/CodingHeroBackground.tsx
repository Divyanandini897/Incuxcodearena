'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

// Helper to convert hex colors to RGBA with custom opacities
const hexToRgba = (hex: string, alpha: number): string => {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function CodingHeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Get active theme's primary color
    let primaryColorHex = '#00EA64'; // Fallback neon green
    if (typeof window !== 'undefined') {
      const style = getComputedStyle(document.body);
      const val = style.getPropertyValue('--color-primary').trim();
      if (val) {
        primaryColorHex = val;
      }
    }

    // Resize handler
    const handleResize = () => {
      const parent = containerRef.current;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width;
      canvas.height = height;
    };

    handleResize();
    const resizeObserver = new ResizeObserver(() => handleResize());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Nodes for algorithm grid / neural net (mostly on the right side)
    interface AlgoNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      glow: number;
    }

    const nodes: AlgoNode[] = [];
    const numNodes = 18;

    for (let i = 0; i < numNodes; i++) {
      const minX = width * 0.45;
      nodes.push({
        x: minX + Math.random() * (width - minX),
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15, // Extremely slow drift
        vy: (Math.random() - 0.5) * 0.15,
        radius: 1.2 + Math.random() * 2,
        glow: 8 + Math.random() * 14,
      });
    }

    // Subtle background floating particles
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }

    const particles: Particle[] = [];
    const numParticles = 30;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.1,
        vy: -0.15 - Math.random() * 0.2, // Floats upward
        radius: 0.7 + Math.random() * 1.0,
        alpha: 0.08 + Math.random() * 0.25,
      });
    }

    // Floating programming snippets
    const codeSymbols = ['{ }', '=>', '01', 'dp[i]', 'fn', 'import', 'const', 'return', 'AI', '&&', '||', '++'];
    interface CodeSnippet {
      x: number;
      y: number;
      text: string;
      vy: number;
      alpha: number;
      fontSize: number;
    }

    const snippets: CodeSnippet[] = [];
    const numSnippets = 5;
    for (let i = 0; i < numSnippets; i++) {
      const minX = width * 0.4;
      snippets.push({
        x: minX + Math.random() * (width - minX - 45),
        y: Math.random() * height,
        text: codeSymbols[Math.floor(Math.random() * codeSymbols.length)],
        vy: -0.1 - Math.random() * 0.15,
        alpha: 0.05 + Math.random() * 0.15,
        fontSize: 10 + Math.floor(Math.random() * 3),
      });
    }

    // Mouse positions for subtle interactive parallax
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      targetMouseX = width / 2;
      targetMouseY = height / 2;
    };

    const parentEl = containerRef.current;
    if (parentEl) {
      parentEl.addEventListener('mousemove', handleMouseMove);
      parentEl.addEventListener('mouseleave', handleMouseLeave);
    }

    // Animation loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse tracking
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      const parallaxOffset = {
        x: (mouseX - width / 2) * 0.02,
        y: (mouseY - height / 2) * 0.02,
      };

      // 1. Draw Network Connections
      const minX = width * 0.45;
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off bounds
        if (node.x < minX || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Draw node center
        const finalX = node.x + parallaxOffset.x;
        const finalY = node.y + parallaxOffset.y;

        ctx.beginPath();
        ctx.arc(finalX, finalY, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(primaryColorHex, 0.4);
        ctx.fill();

        // Node soft radial glow
        const glowGrad = ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, node.glow);
        glowGrad.addColorStop(0, hexToRgba(primaryColorHex, 0.12));
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(finalX, finalY, node.glow, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();
      });

      // Connect nodes with thin lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const x1 = nodes[i].x + parallaxOffset.x;
            const y1 = nodes[i].y + parallaxOffset.y;
            const x2 = nodes[j].x + parallaxOffset.x;
            const y2 = nodes[j].y + parallaxOffset.y;

            const opacity = (1 - dist / 110) * 0.12;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = hexToRgba(primaryColorHex, opacity);
            ctx.lineWidth = 0.55;
            ctx.stroke();
          }
        }
      }

      // 2. Draw floating particles
      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;

        // Reset if float out of bounds
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10 || p.x > width + 10) {
          p.vx *= -1;
        }

        const finalX = p.x + parallaxOffset.x * 0.4;
        const finalY = p.y + parallaxOffset.y * 0.4;

        ctx.beginPath();
        ctx.arc(finalX, finalY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(primaryColorHex, p.alpha);
        ctx.fill();
      });

      // 3. Draw floating code snippets
      snippets.forEach((s) => {
        s.y += s.vy;

        // Reset if float out of bounds
        if (s.y < -20) {
          s.y = height + 20;
          const leftBound = width * 0.4;
          s.x = leftBound + Math.random() * (width - leftBound - 45);
        }

        const finalX = s.x + parallaxOffset.x * 0.75;
        const finalY = s.y + parallaxOffset.y * 0.75;

        ctx.font = `bold ${s.fontSize}px "JetBrains Mono", monospace`;
        ctx.fillStyle = hexToRgba(primaryColorHex, s.alpha);
        ctx.fillText(s.text, finalX, finalY);
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (parentEl) {
        parentEl.removeEventListener('mousemove', handleMouseMove);
        parentEl.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
      {/* Premium Digital Illustration Base Backdrop */}
      <img
        src="/coding_hero_bg.png"
        alt="Technology Backdrop"
        loading="lazy"
        className="w-full h-full object-cover opacity-60 brightness-110 contrast-[1.05] group-hover:scale-[1.02] transition-transform duration-1000 ease-out select-none pointer-events-none"
      />
      {/* Animated Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none mix-blend-screen opacity-90"
      />
      {/* Dynamic themed overlays & vignette */}
      <div className="absolute inset-0 bg-[var(--color-hero-overlay)]" />
      <div className="absolute inset-0 bg-[var(--color-hero-gradient)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.3)_100%)] mix-blend-multiply" />
    </div>
  );
}
