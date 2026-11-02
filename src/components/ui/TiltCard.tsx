'use client';

import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
  glareColor?: string;
  onClick?: () => void;
  glowAccent?: string;
}

export default function TiltCard({
  children,
  className = '',
  maxTilt = 12,
  perspective = 1000,
  glareColor = 'rgba(255, 255, 255, 0.25)',
  onClick,
  glowAccent,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const prefersReducedMotion = useReducedMotion();

  const springConfig = { damping: 20, stiffness: 200, mass: 0.1 };
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);
  const scale = useSpring(1, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || maxTilt === 0 || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -maxTilt;
    const rY = ((x - centerX) / centerX) * maxTilt;

    rotateX.set(rX);
    rotateY.set(rY);
    scale.set(1.02);

    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: `${perspective}px` }}
      className="relative h-full w-full"
    >
      <motion.div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          scale: prefersReducedMotion ? 1 : scale,
          transformStyle: 'preserve-3d',
        }}
        className={`relative h-full w-full transition-shadow duration-300 ${className}`}
      >
        {/* Glow accent shadow */}
        {glowAccent && (
          <div
            className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60"
            style={{ background: glowAccent }}
            aria-hidden="true"
          />
        )}

        {/* Card Content with 3D child preservation */}
        <div className="relative z-10 h-full w-full">{children}</div>

        {/* Specular glare reflection overlay */}
        {!prefersReducedMotion && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300"
            style={{
              opacity: glarePos.opacity,
              background: `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, ${glareColor}, transparent 80%)`,
            }}
            aria-hidden="true"
          />
        )}
      </motion.div>
    </div>
  );
}
