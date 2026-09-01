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
    <div className="space-y-6 mb-8">
      {/* MEMBER SPOTLIGHT BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white shadow-md ring-2 ring-rose-400/30">
              <Image
                src={spotlightMember.image}
                alt={spotlightMember.displayName}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 80px, 96px"
              />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-0.5 text-[11px] font-bold text-rose-600 border border-rose-200">
                <Sparkles className="h-3 w-3" />
                <span>Today&apos;s Member Spotlight</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                {spotlightMember.displayName}{' '}
                <span className="text-xs font-medium text-zinc-500">({spotlightMember.koreanName})</span>
              </h2>
              <p className="text-xs text-zinc-600 max-w-md line-clamp-2 italic font-serif">
                &ldquo;{spotlightMember.quote}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col gap-2.5 w-full sm:w-auto">
            <Link
              href={`/members#${spotlightMember.slug}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-zinc-800 border border-zinc-200 shadow-2xs hover:bg-rose-50 hover:border-rose-200 transition-all"
            >
              <span>View Profile</span>
              <ArrowRight className="h-3.5 w-3.5 text-rose-500" />
            </Link>
            <Link
              href="/achievements"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:opacity-95 transition-all"
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Milestones</span>
            </Link>
          </div>
        </div>
      </div>

      {/* DAILY PROMPT CARD */}
      {dailyPrompt && (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-2xs flex-shrink-0 mt-0.5">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                Daily Inspiration Prompt
              </span>
              <p className="text-xs sm:text-sm font-semibold text-zinc-800">
                &ldquo;{dailyPrompt}&rdquo;
              </p>
            </div>
          </div>

          <button
            onClick={() => onPromptClick(dailyPrompt)}
            className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-amber-600 transition-colors"
          >
            <Heart className="h-3.5 w-3.5 fill-white" />
            <span>Answer Prompt</span>
          </button>
        </div>
      )}
    </div>
  );
}
