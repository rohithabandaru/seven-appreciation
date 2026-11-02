'use client';

import React from 'react';
import { Heart, Sparkles, Star } from 'lucide-react';

const TICKER_ITEMS = [
  { text: 'HEESEUNG', type: 'member' },
  { text: 'JAY', type: 'member' },
  { text: 'JAKE', type: 'member' },
  { text: 'SUNGHOON', type: 'member' },
  { text: 'SUNOO', type: 'member' },
  { text: 'JUNGWON', type: 'member' },
  { text: 'NI-KI', type: 'member' },
  { text: 'SUPPORT WITHOUT ATTACKING ANYONE ELSE', type: 'motto' },
  { text: '7 IRREPLACEABLE ARTISTS', type: 'highlight' },
  { text: 'PURE ENGENE APPRECIATION', type: 'highlight' },
];

export default function AnimatedTicker() {
  const content = (
    <div className="flex items-center gap-6 py-2.5 px-4 text-xs font-black tracking-widest uppercase">
      {TICKER_ITEMS.map((item, idx) => (
        <span key={idx} className="flex items-center gap-3 whitespace-nowrap">
          {item.type === 'member' ? (
            <span className="text-zinc-800 dark:text-zinc-200 hover:text-rose-500 transition-colors">
              {item.text}
            </span>
          ) : item.type === 'motto' ? (
            <span className="gradient-text-warm font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-200 dark:border-rose-900/60">
              {item.text}
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {item.text}
            </span>
          )}

          {idx % 3 === 0 ? (
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500 animate-pulse" />
          ) : idx % 3 === 1 ? (
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
          ) : (
            <Star className="h-3 w-3 fill-purple-400 text-purple-400" />
          )}
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative w-full overflow-hidden border-y border-rose-200/70 dark:border-zinc-800 bg-gradient-to-r from-rose-50/60 via-amber-50/50 to-purple-50/60 dark:from-zinc-900/80 dark:via-[#151218] dark:to-zinc-900/80 backdrop-blur-md shadow-2xs my-6">
      {/* Side Fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#FFFDF9] dark:from-[#121014] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#FFFDF9] dark:from-[#121014] to-transparent z-10" />

      {/* Infinite Scrolling Track */}
      <div className="animate-marquee">
        {content}
        {content}
      </div>
    </div>
  );
}
