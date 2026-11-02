'use client';

import { useState, useEffect } from 'react';

export interface MousePosition {
  x: number; // Raw viewport X
  y: number; // Raw viewport Y
  normalizedX: number; // -1 to 1 (left to right)
  normalizedY: number; // -1 to 1 (top to bottom)
}

/**
 * Hook to track mouse or touch position smoothly for 3D parallax effects.
 */
export function useMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Center coordinates as initial default
    setMousePosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      normalizedX: 0,
      normalizedY: 0,
    });

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1; // standard 3D Y up

      setMousePosition({
        x: e.clientX,
        y: e.clientY,
        normalizedX: normX,
        normalizedY: normY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mousePosition;
}

export default useMousePosition;
