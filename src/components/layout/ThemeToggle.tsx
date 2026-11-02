'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredPrefs, savePrefs } from '@/lib/storage';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const stored = getStoredPrefs().theme;
    const isDark =
      stored === 'dark' ||
      (!stored && typeof window !== 'undefined' && document.documentElement.classList.contains('dark')) ||
      (!stored && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const activeTheme = isDark ? 'dark' : 'light';
    setTheme(activeTheme);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    savePrefs({ ...getStoredPrefs(), theme: next });
  };

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-xl border border-rose-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200/80 bg-white/90 text-zinc-600 transition-all hover:border-rose-400 hover:text-rose-600 hover:shadow-md hover:shadow-rose-500/10 dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:border-rose-400 dark:hover:text-rose-300 cursor-pointer overflow-hidden group"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode (Moon)'}
      title={isDark ? 'Switch to Day Light' : 'Switch to Moonlight (Dark Mode)'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <Sun className="h-4 w-4 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <Moon className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:text-rose-500 transition-colors drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
