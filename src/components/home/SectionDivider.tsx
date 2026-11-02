'use client';

import React from 'react';
import { Heart } from 'lucide-react';

interface SectionDividerProps {
  label?: string;
  className?: string;
}

export default function SectionDivider({ label, className = '' }: SectionDividerProps) {
  return (
    <div className={`relative flex items-center justify-center py-6 sm:py-8 ${className}`}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-rose-100/80 dark:border-zinc-800/80" />
      </div>
      <div className="relative flex items-center gap-2 bg-[#FFFDF9] dark:bg-[#121014] px-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
        <div className="h-1.5 w-1.5 rounded-full bg-rose-400/60 animate-pulse" />
        {label ? (
          <span className="tracking-wider uppercase text-[10px] text-zinc-500 dark:text-zinc-400 font-bold">
            {label}
          </span>
        ) : (
          <Heart className="h-3.5 w-3.5 text-rose-400/80 fill-rose-300/30" />
        )}
        <div className="h-1.5 w-1.5 rounded-full bg-amber-400/60 animate-pulse" />
      </div>
    </div>
  );
}
