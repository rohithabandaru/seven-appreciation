'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import { Users, ArrowRight, Sparkles, Search, Camera } from 'lucide-react';

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeVisualTab, setActiveVisualTab] = useState<'All' | 'Stage' | 'Concept' | 'Studio' | 'Casual'>('All');

  const filteredMembers = MEMBERS_DATA.filter(
    (m) =>
      m.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.role ? m.role.toLowerCase().includes(searchTerm.toLowerCase()) : false)
  );

  // Flatten all photos from all 7 members for the Visual Highlights showcase
  const allMoments = MEMBERS_DATA.flatMap((m) =>
    (m.photos || []).map((p) => ({
      ...p,
      memberSlug: m.slug,
      memberName: m.displayName,
      memberGradient: m.colorGradient
    }))
  );

  const filteredMoments = activeVisualTab === 'All'
    ? allMoments
    : allMoments.filter((p) => p.category?.toLowerCase() === activeVisualTab.toLowerCase());

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl w-full space-y-16">
        {/* Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 px-4 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
              <Users className="h-3.5 w-3.5" />
              <span>Equal Visual Importance & Respect</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              The Seven Profiles
            </h1>

            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Discover the artistry, milestones, visual galleries, and dedicated appreciation walls for each of the seven individuals. No rankings, no scores, no leaderboards.
            </p>

            {/* Search bar */}
            <div className="relative max-w-md mx-auto pt-2">
              <Search className="absolute left-3.5 top-5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search member by name or role..."
                className="w-full rounded-2xl border border-rose-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-3 pl-10 pr-4 text-xs font-medium text-zinc-800 dark:text-zinc-100 shadow-sm focus:border-rose-500 focus:outline-hidden transition-colors"
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Member Grid Safeguard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member, idx) => {
            const photoCount = member.photos?.length || 0;
            return (
              <ScrollReveal key={member.id} direction="up" delay={idx * 70}>
                <div
                  id={member.slug}
                  className="group flex flex-col h-full rounded-3xl border border-rose-100/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-rose-300 dark:hover:border-rose-700 scroll-mt-24"
                  style={{
                    boxShadow: `0 8px 30px -10px ${member.accentColor}20`,
                  }}
                >
                  {/* Profile Image */}
                  <div className="relative aspect-3/4 sm:aspect-4/5 w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
                    <Image
                      src={member.image}
                      alt={member.displayName}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ objectPosition: member.imagePosition || 'center 18%' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${member.colorGradient} opacity-30 group-hover:opacity-45 transition-opacity duration-300`} />
                    <div className="absolute top-3 right-3 rounded-full bg-white/90 dark:bg-zinc-900/90 px-3 py-1 text-xs font-bold text-zinc-800 dark:text-zinc-200 backdrop-blur-md shadow-xs">
                      {member.koreanName}
                    </div>

                    {photoCount > 0 && (
                      <div className="absolute bottom-3 left-3 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-sm">
                        <Camera className="h-3 w-3" />
                        <span>{photoCount} Photos</span>
                      </div>
                    )}
                  </div>

                  {/* Bio & Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {member.displayName}
                      </h3>
                      <span className="text-[10px] font-bold text-zinc-400">{member.birthDate}</span>
                    </div>
                    {member.role ? (
                      <p className="text-xs font-bold text-rose-500">{member.role}</p>
                    ) : null}
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                      {member.bio}
                    </p>
                  </div>

                  {/* Quote Snippet */}
                  <div className="mt-4 rounded-xl bg-amber-50/60 dark:bg-zinc-800/60 p-3 text-[11px] italic text-zinc-600 dark:text-zinc-400 border border-amber-100 dark:border-zinc-700">
                    &quot;{member.quote}&quot;
                  </div>

                  {/* View Profile Action */}
                  <div className="mt-5 border-t border-zinc-100 dark:border-zinc-800 pt-4 flex items-center justify-between text-xs font-bold">
                    <Link
                      href={`/members/${member.slug}`}
                      className="text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 text-xs font-semibold"
                    >
                      <span>View Gallery</span>
                    </Link>

                    <Link
                      href={`/members/${member.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-2 text-white shadow-sm transition-all duration-200 hover:scale-105 active:scale-98"
                    >
                      <span>Explore</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* VISUAL HIGHLIGHTS OF THE SEVEN */}
        <section className="rounded-3xl border border-rose-200/80 bg-gradient-to-b from-rose-50/40 via-white to-amber-50/30 p-8 sm:p-10 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Curated Moments</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
                Visual Highlights of All Seven
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Capturing stage energy, studio artistry, and warm radiant memories.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {(['All', 'Stage', 'Concept', 'Studio', 'Casual'] as const).map((tab) => {
                const isActive = activeVisualTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveVisualTab(tab)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all border ${
                      isActive
                        ? 'border-rose-500 bg-rose-500 text-white shadow-xs'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-rose-200'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Showcase Carousel / Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {filteredMoments.slice(0, 14).map((moment, idx) => (
              <Link
                key={moment.id || idx}
                href={`/members/${moment.memberSlug}`}
                className="group relative aspect-3/4 rounded-2xl overflow-hidden shadow-xs border border-rose-100/80 bg-zinc-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
              >
                <Image src={moment.url} alt={moment.caption || 'Moment'} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5 text-white">
                  <span className="text-[10px] font-bold text-rose-300">{moment.memberName}</span>
                  <p className="text-[11px] font-medium line-clamp-2 leading-tight">
                    {moment.caption}
                  </p>
                </div>
                <div className="absolute top-2 left-2 rounded-md bg-black/50 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-white">
                  {moment.memberName}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
