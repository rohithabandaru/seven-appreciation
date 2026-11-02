'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import { Member } from '@/types';
import TiltCard from '@/components/ui/TiltCard';
import MagneticButton from '@/components/ui/MagneticButton';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Heart, ArrowLeft, ArrowRight, Sparkles, ExternalLink, X } from 'lucide-react';

interface MemberRingProps {
  onFilterMember?: (memberSlug: string) => void;
}

// Small glowing pearl/pink particles positioned at far outer edges, matching the hero scene
const PEARL_PARTICLES = [
  { id: 1, side: 'left',  x: '4%',  y: '22%', size: 'w-2 h-2',       delay: '0s',    color: 'bg-rose-300/40 dark:bg-rose-400/50 shadow-rose-300/50' },
  { id: 2, side: 'left',  x: '9%',  y: '65%', size: 'w-2.5 h-2.5',   delay: '2.5s',  color: 'bg-pink-200/50 dark:bg-pink-300/50 shadow-pink-300/60' },
  { id: 3, side: 'left',  x: '13%', y: '40%', size: 'w-1.5 h-1.5',   delay: '1.2s',  color: 'bg-white/60 dark:bg-rose-200/60 shadow-white/50' },
  { id: 4, side: 'left',  x: '6%',  y: '82%', size: 'w-2 h-2',       delay: '3.8s',  color: 'bg-rose-400/40 dark:bg-rose-500/40 shadow-rose-400/50' },
  { id: 5, side: 'right', x: '94%', y: '25%', size: 'w-2.5 h-2.5',   delay: '0.8s',  color: 'bg-pink-300/50 dark:bg-pink-400/50 shadow-pink-300/60' },
  { id: 6, side: 'right', x: '90%', y: '70%', size: 'w-2 h-2',       delay: '3.1s',  color: 'bg-rose-300/40 dark:bg-rose-400/50 shadow-rose-300/50' },
  { id: 7, side: 'right', x: '86%', y: '38%', size: 'w-1.5 h-1.5',   delay: '1.8s',  color: 'bg-white/60 dark:bg-pink-200/60 shadow-white/50' },
  { id: 8, side: 'right', x: '93%', y: '80%', size: 'w-3 h-3',       delay: '4.2s',  color: 'bg-purple-300/40 dark:bg-purple-400/40 shadow-purple-300/50' },
];

export default function MemberRing({ onFilterMember }: MemberRingProps) {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeModalMember, setActiveModalMember] = useState<Member | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const dragStartX = useRef(0);
  const currentAngle = useRef(0);
  const velocity = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  const numMembers = MEMBERS_DATA.length; // 7
  const angleStep = 360 / numMembers; // ~51.43 deg

  // Snap to a specific member
  const rotateToMember = useCallback(
    (index: number) => {
      const targetAngle = -index * angleStep;
      // Find shortest rotation
      let diff = (targetAngle - (currentAngle.current % 360)) % 360;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      const newTarget = currentAngle.current + diff;
      currentAngle.current = newTarget;
      setRotationAngle(newTarget);
      setSelectedIndex((index + numMembers) % numMembers);
    },
    [angleStep, numMembers]
  );

  const nextMember = () => {
    rotateToMember((selectedIndex + 1) % numMembers);
  };

  const prevMember = () => {
    rotateToMember((selectedIndex - 1 + numMembers) % numMembers);
  };

  // Auto-rotate with smooth pause on user hover or interaction
  useEffect(() => {
    if (isHovered || isDragging || activeModalMember || prefersReducedMotion) return;

    const interval = setInterval(() => {
      rotateToMember((selectedIndex + 1) % numMembers);
    }, 4500);

    return () => clearInterval(interval);
  }, [isHovered, isDragging, activeModalMember, prefersReducedMotion, selectedIndex, numMembers, rotateToMember]);

  // Mouse / Touch Drag & Parallax Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    velocity.current = 0;
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // Parallax stage tilt tracking via DOM ref — 0 React re-renders!
    if (!prefersReducedMotion && stageRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      const tiltX = -ny * 7;
      const tiltY = nx * 10;
      stageRef.current.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }

    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX.current;
    dragStartX.current = e.clientX;

    // Convert pixels to rotation angle
    const angleDelta = deltaX * 0.45;
    velocity.current = angleDelta;
    currentAngle.current += angleDelta;
    setRotationAngle(currentAngle.current);

    // Update active centered index
    const normalized = ((-currentAngle.current % 360) + 360) % 360;
    const closestIdx = Math.round(normalized / angleStep) % numMembers;
    setSelectedIndex(closestIdx);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Snap to nearest member with spring
    const normalized = ((-currentAngle.current % 360) + 360) % 360;
    const nearestIdx = Math.round(normalized / angleStep) % numMembers;
    rotateToMember(nearestIdx);
  };

  const handleStageMouseLeave = () => {
    setIsHovered(false);
    if (stageRef.current) {
      stageRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

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
    <div className="relative w-full pt-1 sm:pt-2 pb-6 sm:pb-8 overflow-hidden select-none">
      {/* Soft radial burgundy-to-magenta glow behind center card */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] sm:w-[780px] h-[360px] sm:h-[450px] rounded-full blur-3xl opacity-75 dark:opacity-85 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at center, ${MEMBERS_DATA[selectedIndex]?.accentColor || '#E11D48'}44 0%, #BE185D25 45%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Floating Pearl/Pink particles at far outer edges */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {PEARL_PARTICLES.map((p) => (
          <div
            key={p.id}
            className={`absolute rounded-full ${p.size} ${p.color} shadow-sm animate-float-slow`}
            style={{
              left: p.x,
              top: p.y,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Soft elliptical shadow/glow under the cards (pink tint) */}
      <div
        className="pointer-events-none absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[720px] sm:w-[860px] h-[75px] sm:h-[95px] rounded-[100%] bg-gradient-to-r from-rose-500/20 via-pink-500/30 to-purple-500/20 dark:from-rose-600/35 dark:via-pink-500/40 dark:to-purple-700/30 blur-2xl opacity-80"
        aria-hidden="true"
      />

      {/* 3D Ring Stage Carousel with Parallax Mouse Tilt & Hover Pause */}
      <div
        className="relative mx-auto h-[480px] sm:h-[520px] max-w-5xl cursor-grab active:cursor-grabbing touch-pan-y"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleStageMouseLeave}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          perspective: '1000px', // Lower perspective = significantly stronger optical 3D depth
        }}
      >
        <div
          ref={stageRef}
          className="relative w-full h-full flex items-center justify-center will-change-transform"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(0deg) rotateY(0deg)',
            transition: isDragging ? 'none' : 'transform 0.22s ease-out',
          }}
        >
          {/* 3D Holographic Orbit Ring Track on the Floor */}
          <div
            className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 w-[780px] h-[460px] rounded-[100%] border-2 border-rose-500/25 dark:border-rose-400/35 border-dashed"
            style={{
              transform: 'rotateX(76deg) translateZ(-60px)',
              transformStyle: 'preserve-3d',
            }}
            aria-hidden="true"
          >
            {/* Concentric glowing inner resonance ring */}
            <div className="absolute inset-5 rounded-[100%] border border-pink-400/20 dark:border-pink-500/30 blur-[0.5px]" />
          </div>

          {MEMBERS_DATA.map((member, i) => {
            const memberAngle = i * angleStep;
            const currentTotalAngle = rotationAngle + memberAngle;
            // Radian for trigonometric depth positioning
            const rad = (currentTotalAngle * Math.PI) / 180;

            // Deep 3D Amphitheater Dimensions
            const radiusX = 365; // horizontal spread
            const radiusZ = 280; // deeper Z depth
            const x = Math.sin(rad) * radiusX;
            // Push center card out in front (+50px) and back cards deep into background (-510px)
            const z = Math.cos(rad) * radiusZ - (radiusZ * 0.82);

            // 3D Rotations:
            // 1. Yaw angle follows the ring curvature
            const rotY = Math.sin(rad) * 36;
            // 2. Amphitheater pitch: back cards tilt slightly down, front card upright
            const rotX = Math.cos(rad) * -4 + 2;

            // Normalized depth (0 = furthest back, 1 = direct front)
            const depthFactor = (Math.cos(rad) + 1) / 2;
            const isCenter = i === selectedIndex;

            // Scale: center 1.08, side cards ~0.88, back cards progressively down to 0.65
            const cardScale = isCenter ? 1.08 : 0.65 + depthFactor * 0.28;

            // Opacity: center 1.0, side cards ~0.90-0.94, back cards progressively down to ~0.50 (all 7 visible)
            const opacity = isCenter ? 1 : 0.48 + depthFactor * 0.48;

            // Realistic depth-of-field lens blur on back cards (0px in front, up to 2.4px in back)
            const blurPx = prefersReducedMotion ? 0 : Math.max(0, (1 - depthFactor) * 2.4);

            return (
              <div
                key={member.id}
                onClick={() => {
                  if (isCenter) {
                    setActiveModalMember(member);
                  } else {
                    rotateToMember(i);
                  }
                }}
                className="absolute w-[240px] sm:w-[270px] h-[370px] sm:h-[410px] will-change-transform transition-opacity duration-300"
                style={{
                  transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${cardScale})`,
                  transformStyle: 'preserve-3d',
                  zIndex: Math.round(depthFactor * 100),
                  opacity: prefersReducedMotion ? (isCenter ? 1 : 0.4) : opacity,
                  filter: blurPx > 0.4 ? `blur(${blurPx.toFixed(1)}px)` : undefined,
                }}
              >
                {/* Floor shadow under each card */}
                <div
                  className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 w-[75%] h-3.5 rounded-full bg-rose-500/20 dark:bg-rose-400/30 blur-md transition-opacity"
                  style={{ opacity: Math.max(0.18, depthFactor * 0.75) }}
                  aria-hidden="true"
                />

                {/* Subtle floor reflection for the front card */}
                {isCenter && (
                  <div
                    className="pointer-events-none absolute -bottom-20 left-4 right-4 h-20 overflow-hidden opacity-25 dark:opacity-35 blur-[1px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.5),transparent_85%)] -scale-y-100 origin-top select-none"
                    aria-hidden="true"
                  >
                    <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-rose-500/10">
                      <Image
                        src={member.image}
                        alt=""
                        fill
                        sizes="280px"
                        className="object-cover"
                        style={{ objectPosition: member.imagePosition || 'center 18%' }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${member.colorGradient} opacity-50`} />
                    </div>
                  </div>
                )}

                <TiltCard
                  maxTilt={isCenter ? 14 : 0}
                  glowAccent={member.accentColor}
                  className={`rounded-3xl border ${
                    isCenter
                      ? 'border-rose-400/80 dark:border-rose-500/60 shadow-[0_25px_60px_-12px_rgba(244,63,94,0.45)] ring-1 ring-rose-400/30'
                      : 'border-rose-100/90 dark:border-zinc-800 shadow-xl'
                  } bg-white/95 dark:bg-zinc-900/95 p-3.5 hover:shadow-2xl transition-all duration-300`}
                >
                  {/* Member Image with 3D layer depth */}
                  <div
                    className="relative h-56 sm:h-64 w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-3 shadow-inner"
                    style={{ transform: 'translateZ(18px)', transformStyle: 'preserve-3d' }}
                  >
                    <Image
                      src={member.image}
                      alt={member.displayName}
                      fill
                      sizes="280px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                      style={{ objectPosition: member.imagePosition || 'center 18%' }}
                    />

                    {/* Gradient color cast */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${member.colorGradient} opacity-30`}
                    />

                    {/* Korean Name Badge */}
                    <div
                      className="absolute top-2.5 right-2.5 rounded-full bg-white/95 dark:bg-zinc-800/95 px-2.5 py-0.5 text-[11px] font-black text-zinc-900 dark:text-zinc-100 backdrop-blur-md shadow-xs border border-white/60 dark:border-zinc-700"
                      style={{ transform: 'translateZ(30px)' }}
                    >
                      {member.koreanName}
                    </div>

                    {/* Active Spotlight Marker */}
                    {isCenter && (
                      <div
                        className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold px-2.5 py-0.5 shadow-md"
                        style={{ transform: 'translateZ(34px)' }}
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Spotlight</span>
                      </div>
                    )}
                  </div>

                  {/* Member Info with 3D layer popout */}
                  <div
                    className="flex flex-col justify-between flex-1"
                    style={{ transform: 'translateZ(22px)' }}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                          {member.displayName}
                        </h3>
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: member.accentColor || '#F43F5E' }}
                        />
                      </div>
                      {member.role ? (
                        <p className="text-[11px] font-bold text-rose-600 dark:text-rose-300 truncate mt-0.5">
                          {member.role}
                        </p>
                      ) : null}
                      <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-200 line-clamp-1 mt-1 font-serif">
                        &ldquo;{member.quote}&rdquo;
                      </p>
                    </div>

                    {/* Quick Action when Center */}
                    {isCenter && (
                      <div
                        className="mt-2.5 pt-2 border-t border-rose-100/70 dark:border-zinc-800 flex items-center gap-2"
                        style={{ transform: 'translateZ(26px)' }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFeedFilter(member.slug);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white shadow-md shadow-rose-500/40 hover:shadow-lg hover:shadow-rose-500/50 py-1.5 px-2.5 text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
                        >
                          <Heart className="h-3 w-3 fill-white text-white" />
                          <span>Appreciation</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModalMember(member);
                          }}
                          className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                          title="Zoom In"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </TiltCard>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ring Controls & Member Dots Navigation */}
      <div className="relative z-20 flex flex-col items-center justify-center gap-4 mt-4">
        {/* Prev / Next Arrows */}
        <div className="flex items-center gap-4">
          <MagneticButton>
            <button
              onClick={prevMember}
              aria-label="Previous Member"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-md text-zinc-700 dark:text-zinc-300 hover:text-rose-600 hover:border-rose-400 transition-all cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </MagneticButton>

          <div className="text-center min-w-[140px]">
            <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">
              {MEMBERS_DATA[selectedIndex]?.displayName}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Member {selectedIndex + 1} of 7
            </p>
          </div>

          <MagneticButton>
            <button
              onClick={nextMember}
              aria-label="Next Member"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-md text-zinc-700 dark:text-zinc-300 hover:text-rose-600 hover:border-rose-400 transition-all cursor-pointer"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </MagneticButton>
        </div>

        {/* 7 Color-Coded Member Indicator Bullets */}
        <div className="flex items-center gap-2">
          {MEMBERS_DATA.map((member, i) => {
            const isCenter = i === selectedIndex;
            return (
              <button
                key={member.id}
                onClick={() => rotateToMember(i)}
                aria-label={`View ${member.displayName}`}
                className="group relative flex items-center justify-center p-1 cursor-pointer"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isCenter ? 'h-3.5 w-7 shadow-sm' : 'h-2 w-2 opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: member.accentColor || '#F43F5E',
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Member Zoom Detail Modal Transition */}
      <AnimatePresence>
        {activeModalMember && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setActiveModalMember(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-rose-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl"
              style={{
                boxShadow: `0 20px 50px -10px ${activeModalMember.accentColor}33`,
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalMember(null)}
                className="absolute top-4 right-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 transition-colors cursor-pointer"
                aria-label="Close details"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="relative h-44 w-36 flex-shrink-0 overflow-hidden rounded-2xl shadow-md border border-rose-100">
                  <Image
                    src={activeModalMember.image}
                    alt={activeModalMember.displayName}
                    fill
                    className="object-cover"
                    style={{ objectPosition: activeModalMember.imagePosition || 'center 18%' }}
                  />
                  <div
                    className="absolute inset-0 opacity-25"
                    style={{ background: activeModalMember.accentColor }}
                  />
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                      {activeModalMember.displayName}
                    </h3>
                    <span className="text-xs font-bold text-zinc-400">
                      {activeModalMember.koreanName}
                    </span>
                  </div>

                  {activeModalMember.role ? (
                    <p
                      className="text-xs font-bold"
                      style={{ color: activeModalMember.accentColor }}
                    >
                      {activeModalMember.role}
                    </p>
                  ) : null}

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pt-1">
                    {activeModalMember.bio}
                  </p>

                  <blockquote className="text-xs italic text-zinc-500 font-serif border-l-2 border-rose-300 pl-2 mt-2">
                    &ldquo;{activeModalMember.quote}&rdquo;
                  </blockquote>
                </div>
              </div>

              {/* Action buttons inside detail view */}
              <div className="mt-6 pt-5 border-t border-rose-100/70 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    handleFeedFilter(activeModalMember.slug);
                    setActiveModalMember(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 hover:bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-500/25 transition-all cursor-pointer"
                >
                  <Heart className="h-3.5 w-3.5 fill-white" />
                  <span>View Member Feed</span>
                </button>

                <Link
                  href={`/members#${activeModalMember.slug}`}
                  onClick={() => setActiveModalMember(null)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span>Full Profile & Gallery</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
