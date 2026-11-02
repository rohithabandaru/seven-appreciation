'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import ScrollReveal from '@/components/ui/ScrollReveal';
import TiltCard from '@/components/ui/TiltCard';
import MemberRingLazy from '@/components/3d/MemberRingLazy';
import { Sparkles, ArrowRight, Heart, Orbit, Grid } from 'lucide-react';

interface SevenMembersSectionProps {
  onFilterMember?: (memberSlug: string) => void;
}

export default function SevenMembersSection({ onFilterMember }: SevenMembersSectionProps) {
  const [viewMode, setViewMode] = useState<'3d-ring' | 'grid'>('3d-ring');

  const handleFeedFilter = (slug: string) => {
    if (onFilterMember) {
      onFilterMember(slug);
    }
    const feedEl = document.getElementById('community-feed-top');
    if (feedEl) {
      feedEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="seven-members" className="relative py-6 sm:py-8 scroll-mt-20 rounded-3xl dark:bg-gradient-to-b dark:from-[#1A101A]/60 dark:via-[#140D15]/80 dark:to-[#100912]/60 transition-colors">
      {/* Ambient background glow orb */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-rose-500/15 dark:bg-rose-500/20 blur-3xl"
        aria-hidden="true"
      />

      {/* Section Header */}
      <ScrollReveal direction="up" delay={0}>
        <div className="text-center max-w-2xl mx-auto mb-2 sm:mb-3 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/90 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 px-4 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 shadow-xs transition-transform hover:scale-104">
            <Sparkles className="h-3.5 w-3.5 text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Equal Appreciation For All Seven</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            The Seven Irreplaceable Artists
          </h2>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Every member brings his own unique vocal color, stage charisma, passion, and warmth. Spin through the 3D gallery or discover their individual artistry.
          </p>

          {/* View Mode Toggle: 3D Ring vs Gallery Grid */}
          <div className="pt-1 flex items-center justify-center gap-2">
            <div className="inline-flex items-center p-1 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-rose-200/70 dark:border-zinc-800 shadow-xs backdrop-blur-md">
              <button
                onClick={() => setViewMode('3d-ring')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  viewMode === '3d-ring'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-rose-600'
                }`}
              >
                <Orbit className="h-3.5 w-3.5" />
                <span>3D Constellation Ring</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-rose-600'
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                <span>Grid View</span>
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* 3D Ring Carousel Mode */}
      {viewMode === '3d-ring' ? (
        <MemberRingLazy onFilterMember={onFilterMember} />
      ) : (
        /* Seven Member Cards Grid — Equal Visual Importance with Interactive 3D Glare & Tilt */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 lg:gap-3.5">
          {MEMBERS_DATA.map((member, idx) => {
            return (
              <ScrollReveal
                key={member.id}
                direction="up"
                delay={idx * 65}
                className="h-full"
              >
                <TiltCard
                  maxTilt={12}
                  glowAccent={member.accentColor}
                  className="group relative flex flex-col h-full rounded-2xl border border-rose-100/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-3.5 shadow-sm hover:border-rose-300 dark:hover:border-rose-600 backdrop-blur-xs overflow-hidden cursor-pointer"
                >
                  {/* Member Portrait Image */}
                  <div className="relative h-64 sm:h-56 xl:h-52 w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-3 shadow-inner">
                    <Image
                      src={member.image}
                      alt={member.displayName}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 15vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      style={{ objectPosition: member.imagePosition || 'center 18%' }}
                    />

                    {/* Member Signature Color Ambient Gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${member.colorGradient} opacity-25 group-hover:opacity-50 transition-opacity duration-300`}
                    />

                    {/* Subtle Light Reflection sweep on card hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />

                    {/* Korean Name Badge */}
                    <div className="absolute top-2.5 right-2.5 rounded-full bg-white/95 dark:bg-zinc-900/95 px-2.5 py-0.5 text-[11px] font-bold text-zinc-800 dark:text-zinc-200 backdrop-blur-md shadow-xs border border-white/50 dark:border-zinc-700/50">
                      {member.koreanName}
                    </div>
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-baseline justify-between gap-1">
                        <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {member.displayName}
                        </h3>
                        <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 truncate">
                          {member.birthDate.split(',')[0]}
                        </span>
                      </div>

                      {member.role ? (
                        <p className="text-[11px] font-bold text-rose-500 dark:text-rose-400 line-clamp-1 mt-0.5">
                          {member.role}
                        </p>
                      ) : null}

                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic line-clamp-2 mt-1.5 font-serif leading-snug">
                        &ldquo;{member.quote}&rdquo;
                      </p>
                    </div>

                    {/* Actions: View Profile & Filter Feed */}
                    <div className="pt-2.5 flex flex-col gap-1.5 border-t border-rose-100/70 dark:border-zinc-800">
                      <button
                        onClick={() => handleFeedFilter(member.slug)}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 py-1.5 px-2 text-[11px] font-bold text-rose-600 dark:text-rose-300 transition-all duration-200 cursor-pointer active:scale-95 shadow-2xs group/btn"
                      >
                        <Heart className="h-3 w-3 fill-rose-500 group-hover/btn:fill-white transition-colors" />
                        <span>Appreciation Feed</span>
                      </button>

                      <Link
                        href={`/members#${member.slug}`}
                        className="w-full inline-flex items-center justify-center gap-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 hover:border-rose-300 dark:hover:border-rose-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 py-1.5 px-2 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 transition-all duration-200 hover:scale-102 active:scale-98"
                      >
                        <span>Full Profile</span>
                        <ArrowRight className="h-3 w-3 text-zinc-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </section>
  );
}
