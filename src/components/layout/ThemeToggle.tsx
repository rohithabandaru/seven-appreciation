'use client';

import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { getStoredPrefs, savePrefs } from '@/lib/storage';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = getStoredPrefs().theme;
    const initial =
      stored === 'dark' || stored === 'light'
        ? stored
        : typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
          ? 'dark'
          : 'light';
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', initial === 'dark');
    }
    return initial;
  });

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    savePrefs({ ...getStoredPrefs(), theme: next });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-white text-zinc-600 transition-colors hover:border-rose-300 hover:text-rose-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-rose-400 dark:hover:text-rose-300"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
