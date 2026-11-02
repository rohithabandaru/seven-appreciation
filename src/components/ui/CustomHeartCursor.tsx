'use client';

import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface HeartParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  driftX: number;
  rotation: number;
  opacity: number;
}

const PASTEL_COLORS = [
  'rgba(244, 63, 94, 0.7)',   // Rose
  'rgba(245, 158, 11, 0.7)',  // Amber
  'rgba(168, 85, 247, 0.7)',  // Purple
  'rgba(236, 72, 153, 0.7)',  // Pink
  'rgba(59, 130, 246, 0.7)',   // Blue
  'rgba(16, 185, 129, 0.7)',  // Emerald
];

export default function CustomHeartCursor() {
  const prefersReducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion || typeof window === 'undefined') return;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize, { passive: true });

    let particles: HeartParticle[] = [];
    let lastSpawn = 0;
    let animId: number;

    const drawHeart = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string,
      opacity: number,
      rotation: number
    ) => {
      context.save();
      context.translate(x, y);
      context.rotate((rotation * Math.PI) / 180);
      context.globalAlpha = Math.max(0, opacity);
      context.fillStyle = color;

      // Draw SVG-like heart path
      const scale = size / 24;
      context.scale(scale, scale);
      context.beginPath();
      context.moveTo(0, 7);
      context.bezierCurveTo(-5, 0, -12, 3, -12, 10);
      context.bezierCurveTo(-12, 16, -5, 20, 0, 24);
      context.bezierCurveTo(5, 20, 12, 16, 12, 10);
      context.bezierCurveTo(12, 3, 5, 0, 0, 7);
      context.fill();
      context.restore();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX - 8}px, ${e.clientY - 8}px, 0)`;
      }

      const now = performance.now();
      if (now - lastSpawn > 50) {
        lastSpawn = now;
        particles.push({
          x: e.clientX,
          y: e.clientY - 6,
          size: Math.random() * 6 + 10,
          color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
          driftX: (Math.random() - 0.5) * 1.5,
          rotation: (Math.random() - 0.5) * 30,
          opacity: 0.85,
        });

        if (particles.length > 20) {
          particles.shift();
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 0 React re-renders, 100% smooth GPU loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y -= 1.1;
        p.x += p.driftX;
        p.opacity -= 0.035;

        if (p.opacity <= 0) {
          particles.splice(i, 1);
        } else {
          drawHeart(ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden" aria-hidden="true">
      {/* Canvas for heart trail — zero React re-render overhead */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Main glowing cursor heart */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-4 h-4 will-change-transform pointer-events-none hidden md:block"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.85)]"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
    </div>
  );
}
