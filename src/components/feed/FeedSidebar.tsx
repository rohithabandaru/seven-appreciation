'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  Cake, 
  ShieldCheck, 
  ArrowRight, 
  Users 
} from 'lucide-react';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import { getUpcomingBirthdays } from '@/lib/birthdays';
import { UpcomingBirthday } from '@/types';

export default function FeedSidebar() {
  const [birthdays] = useState<UpcomingBirthday[]>(getUpcomingBirthdays().slice(0, 2));
  const [spotlightIndex] = useState(() => {
    const day = new Date().getDate();
    return day % MEMBERS_DATA.length;
  });

  const spotlightMember = MEMBERS_DATA[spotlightIndex] || MEMBERS_DATA[0];

  return (
    <aside className="space-y-6">
      {/* 1. Member Spotlight Card */}
      {spotlightMember && (
        <div className="relative overflow-hidden rounded-3xl border border-rose-100/80 bg-white/90 p-5 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between pb-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
              <Sparkles className="h-3 w-3 text-amber-500 fill-amber-400" />
              <span>Today&apos;s Spotlight</span>
            </div>
            <Link 
              href={`/members/${spotlightMember.slug}`} 
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-0.5"
            >
              <span>Profile</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex items-center gap-3.5 pt-1">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-rose-200/80 shadow-xs">
              <Image
                src={spotlightMember.image}
                alt={spotlightMember.displayName}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div>
              <h4 className="text-base font-bold text-zinc-900 leading-tight">
                {spotlightMember.displayName}
              </h4>
              <p className="text-xs font-medium text-zinc-500">{spotlightMember.koreanName}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-rose-600 line-clamp-1">
                {spotlightMember.role}
              </p>
            </div>
          </div>

          <p className="mt-3 rounded-xl bg-rose-50/50 p-3 text-xs italic text-zinc-700 leading-relaxed border border-rose-100/50">
            &quot;{spotlightMember.quote}&quot;
          </p>
        </div>
      )}

      {/* 2. Upcoming Birthdays Card */}
      {birthdays.length > 0 && (
        <div className="rounded-3xl border border-rose-100/80 bg-white/90 p-5 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
              <Cake className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">Upcoming Celebrations</h3>
          </div>

          <div className="space-y-2.5">
            {birthdays.map((b) => (
              <div
                key={b.slug}
                className="flex items-center justify-between rounded-2xl bg-zinc-50/70 p-2.5 border border-zinc-100"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-rose-100">
                    <Image
                      src={b.image}
                      alt={b.displayName}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block">{b.displayName}</span>
                    <span className="text-[10px] text-zinc-500">{b.monthDay}</span>
                  </div>
                </div>
                <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600 border border-rose-100">
                  {b.daysUntil === 0 ? 'Today!' : `${b.daysUntil}d away`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Community Promise Card */}
      <div className="rounded-3xl border border-purple-100/80 bg-gradient-to-br from-purple-50/60 via-white to-rose-50/40 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-4 w-4 text-purple-600" />
          <h3 className="text-sm font-bold text-zinc-900">Safe Space Promise</h3>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed mb-3">
          Attacking or comparing other artists is strictly filtered.
        </p>
        <Link
          href="/guidelines"
          className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline"
        >
          <span>Read Community Guidelines</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* 4. Explore The Seven Navigation Mini-Banner */}
      <div className="rounded-3xl border border-amber-100 bg-amber-50/60 p-4 text-center">
        <p className="text-xs font-bold text-amber-900 mb-1">Meet the Artists</p>
        <p className="text-[11px] text-amber-700 mb-3">Explore full journeys, vocal highlights, and achievements.</p>
        <Link
          href="/members"
          className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-white border border-amber-200 py-2 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100/50 transition-colors"
        >
          <Users className="h-3.5 w-3.5 text-amber-600" />
          <span>Explore The Seven</span>
        </Link>
      </div>
    </aside>
  );
}
