'use client';

import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function ParallaxBackgroundBlobs() {
  const prefersReducedMotion = useReducedMotion();
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion || typeof window === 'undefined') return;

    let rafId: number;

    const onScroll = () => {
      const scrollY = window.scrollY;

      if (blob1Ref.current) {
        blob1Ref.current.style.transform = `translate3d(0, ${scrollY * 0.12}px, 0)`;
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translate3d(0, ${-scrollY * 0.08}px, 0)`;
      }
      if (blob3Ref.current) {
        blob3Ref.current.style.transform = `translate3d(0, ${scrollY * 0.05}px, 0)`;
      }
    };

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(onScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden opacity-60 dark:opacity-30" aria-hidden="true">
      {/* Top Left Rose Blush Glow */}
      <div
        ref={blob1Ref}
        className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-rose-300/35 via-pink-200/25 to-transparent blur-3xl will-change-transform"
      />

      {/* Center Right Warm Amber & Purple Glow */}
      <div
        ref={blob2Ref}
        className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tl from-amber-300/30 via-purple-300/25 to-transparent blur-3xl will-change-transform"
      />

      {/* Bottom Left Sunset Glow */}
      <div
        ref={blob3Ref}
        className="absolute -bottom-40 left-1/4 h-[550px] w-[550px] rounded-full bg-gradient-to-tr from-rose-400/25 via-amber-200/20 to-purple-400/20 blur-3xl will-change-transform"
      />
    </div>
  );
}
