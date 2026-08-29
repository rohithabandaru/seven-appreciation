'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function FloatingCoffee() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (dismissed || !visible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-end gap-1.5"
      style={{ animation: 'coffeeFloat 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
    >
      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="mb-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/80 dark:bg-zinc-800/80 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 shadow border border-zinc-100 dark:border-zinc-700 transition-colors backdrop-blur-sm opacity-0 hover:opacity-100 focus:opacity-100"
        aria-label="Dismiss"
      >
        <X className="h-2.5 w-2.5" />
      </button>

      {/* Main button */}
      <a
        href="https://www.buymeacoffee.com/Rohitha.Bandaru"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center gap-3 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 px-5 py-3.5 text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/35 hover:scale-105 active:scale-95 transition-all duration-200 ring-1 ring-white/20"
        aria-label="Fuel this project with love"
      >
        {/* Subtle pulse glow */}
        <span
          className="absolute inset-0 rounded-2xl animate-ping bg-pink-400/15 pointer-events-none"
          style={{ animationDuration: '4s' }}
        />

        {/* Heart emoji */}
        <span className="text-xl drop-shadow-sm" role="img" aria-hidden="true">💖</span>

        {/* Text */}
        <span className="flex flex-col leading-tight">
          <span className="text-[10px] font-medium opacity-80 tracking-wide uppercase">Made with love</span>
          <span className="text-[13px] font-extrabold tracking-tight">Fuel This Dream</span>
        </span>
      </a>

      <style>{`
        @keyframes coffeeFloat {
          from { opacity: 0; transform: translateY(24px) scale(0.85); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
