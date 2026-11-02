'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import { getDailyPrompt } from '@/lib/data/prompts';
import { Sparkles, Trophy, Lightbulb, ArrowRight, Heart } from 'lucide-react';

interface SpotlightAndPromptProps {
  onPromptClick: (promptText: string) => void;
}

export default function SpotlightAndPrompt({ onPromptClick }: SpotlightAndPromptProps) {
  const [dailyPrompt, setDailyPrompt] = useState('');
  const [spotlightMember, setSpotlightMember] = useState(MEMBERS_DATA[0]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDailyPrompt(getDailyPrompt());
    const dayOfWeek = new Date().getDay(); // 0 to 6
    const memberIndex = dayOfWeek % MEMBERS_DATA.length;
    setSpotlightMember(MEMBERS_DATA[memberIndex]);
  }, []);

  return (
    <div className="space-y-4 mb-4">
      {/* MEMBER SPOTLIGHT BANNER */}
      <div
        className="relative overflow-hidden rounded-3xl border border-rose-100/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-5 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md backdrop-blur-md"
        style={{
          boxShadow: `0 8px 30px -10px ${spotlightMember.accentColor}25`,
        }}
      >
        {/* Subtle background glow */}
        <div
          className={`pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br ${spotlightMember.colorGradient} blur-3xl opacity-30`}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="group relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white dark:border-zinc-700 shadow-md ring-2 ring-rose-400/40">
              <Image
                src={spotlightMember.image}
                alt={spotlightMember.displayName}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                style={{ objectPosition: spotlightMember.imagePosition || 'center 18%' }}
                sizes="(max-width: 640px) 80px, 96px"
              />
            </div>
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 dark:bg-rose-950/40 px-3 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60">
                <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                <span>Today&apos;s Member Spotlight</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                {spotlightMember.displayName}{' '}
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">({spotlightMember.koreanName})</span>
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-md line-clamp-2 italic font-serif leading-relaxed">
                &ldquo;{spotlightMember.quote}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col gap-2.5 w-full sm:w-auto">
            <Link
              href={`/members#${spotlightMember.slug}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs hover:bg-rose-50 dark:hover:bg-zinc-700 hover:border-rose-200 transition-all hover:scale-102 active:scale-98"
            >
              <span>View Profile</span>
              <ArrowRight className="h-3.5 w-3.5 text-rose-500" />
            </Link>
            <Link
              href="/achievements"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:opacity-95 transition-all hover:scale-102 active:scale-98"
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Milestones</span>
            </Link>
          </div>
        </div>
      </div>

      {/* DAILY PROMPT CARD */}
      {dailyPrompt && (
        <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-r from-amber-50/60 via-amber-50/30 to-rose-50/30 dark:from-zinc-900 dark:to-zinc-900 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs backdrop-blur-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xs flex-shrink-0 mt-0.5">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                Daily Inspiration Prompt
              </span>
              <p className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                &ldquo;{dailyPrompt}&rdquo;
              </p>
            </div>
          </div>

          <button
            onClick={() => onPromptClick(dailyPrompt)}
            className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Heart className="h-3.5 w-3.5 fill-white" />
            <span>Answer Prompt</span>
          </button>
        </div>
      )}
    </div>
  );
}
