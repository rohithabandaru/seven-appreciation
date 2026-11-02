'use client';

import React from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function ParallaxBackgroundBlobs() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden opacity-60 dark:opacity-30"
      aria-hidden="true"
    >
      {/* Top Left Rose Blush Glow — Pure CSS radial gradient, 0 GPU blur penalty */}
      <div
        className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(253, 164, 175, 0.35) 0%, rgba(251, 207, 232, 0.18) 45%, transparent 70%)',
        }}
      />

      {/* Center Right Warm Amber & Purple Glow */}
      <div
        className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(252, 211, 77, 0.28) 0%, rgba(216, 180, 254, 0.2) 45%, transparent 70%)',
        }}
      />

      {/* Bottom Left Sunset Glow */}
      <div
        className="absolute -bottom-40 left-1/4 h-[550px] w-[550px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(251, 113, 133, 0.25) 0%, rgba(254, 215, 170, 0.18) 45%, transparent 70%)',
        }}
      />
    </div>
  );
}
