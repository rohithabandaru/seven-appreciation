'use client';

import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  strength?: number; // Distance multiplier for magnetic pull
  glowColor?: string;
  asChild?: boolean;
}

export default function MagneticButton({
  children,
  className = '',
  onClick,
  strength = 0.35,
  glowColor = 'rgba(244, 63, 94, 0.4)',
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    x.set(deltaX);
    y.set(deltaY);

    // Subtle 3D tilt
    const tiltX = ((e.clientY - centerY) / (rect.height / 2)) * -10;
    const tiltY = ((e.clientX - centerX) / (rect.width / 2)) * 10;
    rotateX.set(tiltX);
    rotateY.set(tiltY);
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{
        x: prefersReducedMotion ? 0 : x,
        y: prefersReducedMotion ? 0 : y,
        rotateX: prefersReducedMotion ? 0 : rotateX,
        rotateY: prefersReducedMotion ? 0 : rotateY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative inline-block cursor-pointer select-none ${className}`}
    >
      {/* Dynamic ambient glow behind button */}
      <div
        className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 blur-lg transition-opacity duration-300"
        style={{
          background: glowColor,
          opacity: isHovered && !prefersReducedMotion ? 0.75 : 0,
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </motion.div>
  );
}
