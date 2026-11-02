'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
}

export default function AnimatedCounter({
  value,
  className = '',
}: AnimatedCounterProps) {
  const prefersReducedMotion = useReducedMotion();
  const digits = value.toLocaleString().split('');

  if (prefersReducedMotion) {
    return <span className={className}>{value.toLocaleString()}</span>;
  }

  return (
    <span className={`inline-flex items-center overflow-hidden font-mono ${className}`}>
      {digits.map((char, index) => {
        if (char === ',') {
          return (
            <span key={`comma-${index}`} className="inline-block px-0.5">
              ,
            </span>
          );
        }

        return <RollingDigit key={`digit-${index}-${digits.length}`} digit={char} />;
      })}
    </span>
  );
}

function RollingDigit({ digit }: { digit: string }) {
  const [current, setCurrent] = useState(digit);

  useEffect(() => {
    setCurrent(digit);
  }, [digit]);

  return (
    <span className="relative inline-block h-[1.25em] w-[0.62em] overflow-hidden leading-none align-middle">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={current}
          initial={{ y: '100%', opacity: 0, filter: 'blur(2px)' }}
          animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-100%', opacity: 0, filter: 'blur(2px)' }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
            mass: 0.8,
          }}
          className="absolute inset-0 flex items-center justify-center font-bold"
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
