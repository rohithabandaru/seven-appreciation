'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Radio, Users, ShieldCheck, ArrowDown, Feather, Star } from 'lucide-react';
import HeroSceneLazy from '@/components/3d/HeroSceneLazy';
import MagneticButton from '@/components/ui/MagneticButton';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface HeroSectionProps {
  onOpenCreateModal: () => void;
}

interface FloatingHeartItem {
  id: number;
  x: number;
  drift: number;
  emoji: string;
}

const HEART_EMOJIS = ['❤️', '💖', '✨', '💜', '🧡', '🌟', '💝'];

export default function HeroSection({ onOpenCreateModal }: HeroSectionProps) {
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeartItem[]>([]);
  const [loveCount, setLoveCount] = useState(777);
  const [burstTrigger, setBurstTrigger] = useState(0);
  const [heartBounce, setHeartBounce] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const triggerHearts = (e?: React.MouseEvent) => {
    setLoveCount((prev) => prev + 1);
    setBurstTrigger((prev) => prev + 1);
    setHeartBounce(true);
    setTimeout(() => setHeartBounce(false), 400);

    const count = 6;
    const baseClickX = e ? (e.clientX / window.innerWidth) * 100 : 50;

    const newHearts: FloatingHeartItem[] = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: Math.max(10, Math.min(90, baseClickX + (Math.random() * 20 - 10))),
      drift: Math.floor(Math.random() * 80 - 40),
      emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
    }));

    setFloatingHearts((prev) => [...prev.slice(-15), ...newHearts]);

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 2500);
  };

  const scrollToMembers = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById('seven-members');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Headline word variants for staggered 3D rotateX reveal
  const headlineWords = [
    { text: 'Celebrate', delay: 0.1 },
    { text: 'Their', delay: 0.2 },
    { text: 'Artistry.', delay: 0.3 },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-rose-100/80 dark:border-rose-950/40 bg-gradient-to-b from-[#FFF0F3]/95 via-[#FFF5F7]/95 to-[#FFFAF0] dark:from-[#18131B]/95 dark:via-[#121014]/95 dark:to-[#121014] p-6 sm:p-10 lg:p-14 shadow-2xl shadow-rose-500/10 mb-8 min-h-[580px] flex items-center justify-center">
      {/* 3D Immersive R3F Background Scene */}
      <HeroSceneLazy burstTrigger={burstTrigger} />

      {/* Dark Radial Mask to Protect Text Readability & Contrast */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,rgba(255,245,247,0.82)_0%,rgba(255,245,247,0.4)_55%,transparent_100%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(18,16,20,0.85)_0%,rgba(18,16,20,0.4)_55%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* Floating 2D emoji particle overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
        {floatingHearts.map((h) => (
          <div
            key={h.id}
            className="absolute bottom-10 animate-float-up text-2xl select-none"
            style={{ left: `${h.x}%`, ['--float-drift' as string]: `${h.drift}px` }}
          >
            {h.emoji}
          </div>
        ))}
      </div>

      {/* Atmospheric Aurora Light Shimmers */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-rose-400/25 via-pink-300/20 to-transparent blur-3xl animate-float-orb"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 -right-24 h-96 w-96 rounded-full bg-gradient-to-tl from-pink-400/25 via-purple-400/18 to-transparent blur-3xl animate-float-orb"
        style={{ animationDelay: '-5s' }}
        aria-hidden="true"
      />

      {/* Floating Twinkling Background Stars */}
      <div className="pointer-events-none absolute top-10 left-12 animate-twinkle text-amber-400/80" aria-hidden="true">
        <Star className="h-4 w-4 fill-amber-300" />
      </div>
      <div className="pointer-events-none absolute top-8 right-16 animate-float-slow text-amber-400/70" aria-hidden="true">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="pointer-events-none absolute bottom-14 left-14 animate-twinkle text-purple-400/70" style={{ animationDelay: '1.2s' }} aria-hidden="true">
        <Star className="h-3.5 w-3.5 fill-purple-300" />
      </div>
      <div className="pointer-events-none absolute bottom-12 right-12 animate-float-slow text-rose-400/70" style={{ animationDelay: '-3s' }} aria-hidden="true">
        <Heart className="h-5 w-5 fill-rose-300/40" />
      </div>

      {/* Foreground Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Top Sanctuary Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/90 dark:border-rose-800/60 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 shadow-sm mb-6 transition-all duration-300 hover:scale-104 hover:shadow-md">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
          <span>A Dedicated Sanctuary For All Seven</span>
          <span className="hidden sm:inline text-zinc-300 dark:text-zinc-600">•</span>
          <span className="hidden sm:inline font-medium text-zinc-600 dark:text-zinc-400">Pure Appreciation</span>
        </div>

        {/* Staggered 3D RotateX Reveal Headline */}
        <h1
          className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.15] mb-4"
          style={{ perspective: '1000px' }}
        >
          <span className="inline-block">
            {headlineWords.map((word, idx) => (
              <motion.span
                key={idx}
                initial={prefersReducedMotion ? {} : { opacity: 0, rotateX: 75, y: 25 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, rotateX: 0, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: word.delay,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inline-block mr-2.5 will-change-transform"
                style={{ transformOrigin: '50% 100%' }}
              >
                {word.text}
              </motion.span>
            ))}
          </span>{' '}
          <motion.span
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="block sm:inline bg-gradient-to-r from-rose-500 via-pink-400 to-purple-500 dark:from-rose-400 dark:via-pink-300 dark:to-purple-300 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-flow font-black drop-shadow-[0_2px_12px_rgba(244,63,94,0.35)] dark:drop-shadow-[0_2px_18px_rgba(217,70,239,0.5)]"
          >
            Share Pure Love.
          </motion.span>
        </h1>

        {/* Philosophy Banner with Interactive Click & Glow Aura */}
        <div
          onClick={(e) => triggerHearts(e)}
          className="relative my-4 group max-w-2xl w-full cursor-pointer select-none transition-transform active:scale-98"
          title="Click to celebrate and send love!"
        >
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-purple-500 opacity-40 blur-md group-hover:opacity-80 transition duration-500 animate-gradient-flow" />

          <div className="relative rounded-2xl border border-rose-200/90 dark:border-rose-900/60 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl px-5 py-3.5 sm:px-8 sm:py-4 shadow-sm flex items-center justify-center gap-2.5">
            <Heart
              className={`h-5 w-5 text-rose-500 fill-rose-500 flex-shrink-0 transition-transform duration-300 ${
                heartBounce ? 'scale-135' : 'group-hover:scale-125'
              }`}
            />
            <p className="text-sm sm:text-base lg:text-lg font-black tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
              Support Without Attacking Anyone Else.
            </p>
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse ml-1" />
          </div>
        </div>

        {/* Mission Subtitle */}
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed mt-2 mb-8">
          A peaceful, positive space dedicated to honoring{' '}
          <strong className="font-semibold text-zinc-800 dark:text-zinc-200">
            Heeseung, Jay, Jake, Sunghoon, Sunoo, Jungwon, and Ni-ki
          </strong>
          . Share heartfelt letters, stories, and art celebrating all seven members with kindness and equal respect.
        </p>

        {/* 3D Tilt & Magnetic Interactive CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full">
          {/* Scroll to Seven Members Button */}
          <MagneticButton strength={0.25} glowColor="rgba(244, 63, 94, 0.45)">
            <a
              href="#seven-members"
              onClick={scrollToMembers}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/35 active:scale-95 cursor-pointer"
            >
              <Users className="h-4 w-4" />
              <span>Meet The Seven</span>
              <ArrowDown className="h-3.5 w-3.5 opacity-80 animate-bounce" />
            </a>
          </MagneticButton>

          {/* Share Appreciation Button */}
          <MagneticButton strength={0.25} glowColor="rgba(244, 63, 94, 0.25)">
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 dark:border-rose-900/70 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-5 py-3.5 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-100 shadow-sm transition-all duration-300 hover:bg-rose-50 dark:hover:bg-zinc-800 hover:border-rose-300 active:scale-95 cursor-pointer"
            >
              <Feather className="h-4 w-4 text-rose-500" />
              <span>Write Appreciation</span>
            </button>
          </MagneticButton>

          {/* Interactive Send Love Button with 3D Burst & Rolling Counter */}
          <MagneticButton strength={0.3} glowColor="rgba(245, 158, 11, 0.4)">
            <button
              onClick={(e) => triggerHearts(e)}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-200/90 dark:border-amber-900/60 bg-amber-50/90 dark:bg-amber-950/40 backdrop-blur-md px-4 py-3.5 text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300 shadow-sm transition-all duration-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 active:scale-95 cursor-pointer"
            >
              <Heart
                className={`h-4 w-4 text-rose-500 fill-rose-500 transition-transform duration-200 ${
                  heartBounce ? 'scale-140 rotate-12' : ''
                }`}
              />
              <span>Send Love (</span>
              <AnimatedCounter value={loveCount} className="text-amber-900 dark:text-amber-200" />
              <span>)</span>
            </button>
          </MagneticButton>

          {/* Live Lounge Button */}
          <MagneticButton strength={0.25} glowColor="rgba(139, 92, 246, 0.35)">
            <Link
              href="/live"
              className="inline-flex items-center gap-2 rounded-2xl border border-purple-200/80 dark:border-purple-900/60 bg-purple-50/80 dark:bg-purple-950/40 backdrop-blur-md px-4 py-3.5 text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-300 shadow-sm transition-all duration-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 active:scale-95"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
              </span>
              <Radio className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Live Lounge</span>
            </Link>
          </MagneticButton>
        </div>

        {/* 3 Core Sanctuary Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl mt-10 pt-6 border-t border-rose-100/70 dark:border-rose-950/40 text-left">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-rose-100/60 dark:border-zinc-800/60 backdrop-blur-xs transition-transform hover:scale-102">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white font-black text-sm flex-shrink-0 shadow-xs">
              7
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Seven Members</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Equal love & respect for all</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-rose-100/60 dark:border-zinc-800/60 backdrop-blur-xs transition-transform hover:scale-102">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex-shrink-0 shadow-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">0 Hate & Fan Wars</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Zero tolerance for negativity</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-rose-100/60 dark:border-zinc-800/60 backdrop-blur-xs transition-transform hover:scale-102">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex-shrink-0 shadow-xs">
              <Heart className="h-4 w-4 fill-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">100% Appreciation</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Artistry, vocals, dance & warmth</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
