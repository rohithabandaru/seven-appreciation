'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/ui/Toast';
import TiltCard from '@/components/ui/TiltCard';
import DailyLove3DSceneLazy from '@/components/3d/DailyLove3DSceneLazy';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import type { RandomEngeneLove } from '@/types';
import {
  Heart,
  RefreshCcw,
  PenLine,
  Loader2,
  Sparkles,
  Quote,
  Send,
  ArrowRight,
  ExternalLink,
  User as UserIcon,
  Users,
} from 'lucide-react';

export default function EngeneLovePage() {
  const router = useRouter();

  const [love, setLove] = useState<RandomEngeneLove | null>(null);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Inline Writer Form State ('all' or member slug)
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [messageText, setMessageText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; title: string; message: string } | null>(null);

  const fetchLove = useCallback(
    async (exclude: string[] = []) => {
      setIsRefreshing(true);
      try {
        const params = new URLSearchParams();
        if (exclude.length > 0) params.set('exclude', exclude.join(','));
        const res = await fetch(`/api/daily/random-love?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (data.empty) {
          setEmpty(true);
          setLove(null);
        } else {
          setEmpty(false);
          setLove(data.message);
          setSeenIds((prev) => {
            const next = [...prev, data.message.id];
            return next.slice(-20);
          });
        }
      } catch {
        // Keep current state on error
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLove();
  }, [fetchLove]);

  const handleAnother = () => {
    fetchLove(seenIds);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      setPostError('Please write your appreciation message before submitting.');
      return;
    }

    if (messageText.trim().length < 2) {
      setPostError('Message must be at least 2 characters long.');
      return;
    }

    setIsPosting(true);
    setPostError(null);

    const isAll = selectedMember === 'all';
    const memberObj = MEMBERS_DATA.find((m) => m.slug === selectedMember);
    const targetName = isAll ? 'All 7 Members (ENHYPEN)' : memberObj?.displayName || selectedMember;

    try {
      // 1. Post to AppreciationMessage table (Saves for Member Profile Wall & Random Love)
      const appRes = await fetch('/api/appreciations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMember,
          content: messageText.trim(),
        }),
      });

      const appData = await appRes.json();

      if (!appRes.ok) {
        setPostError(appData.error || 'Failed to submit appreciation note.');
        setIsPosting(false);
        return;
      }

      // 2. Also publish to Feed (Post table) so it shows in the general community feed
      try {
        await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'appreciation',
            title: `Appreciation for ${targetName} 💖`,
            content: messageText.trim(),
            memberId: isAll ? 'all' : selectedMember,
          }),
        });
      } catch {
        // Feed post sync
      }

      setToast({
        type: 'success',
        title: 'Appreciation Published! 💕',
        message: isAll
          ? 'Published to Community Feed! Opening Feed now...'
          : `Published to ${targetName}'s Profile Wall! Opening Profile now...`,
      });

      setMessageText('');

      // Navigate directly as intended:
      // - Specific Member -> Navigate to that Member's Profile page (/members/[slug])
      // - All 7 -> Navigate to Feed (/ or /?tab=Appreciation)
      setTimeout(() => {
        if (!isAll) {
          router.push(`/members/${selectedMember}`);
        } else {
          router.push(`/?tab=Appreciation`);
        }
      }, 500);
    } catch {
      setPostError('Network connection error. Please try again.');
      setIsPosting(false);
    }
  };

  const memberData = love
    ? MEMBERS_DATA.find((m) => m.slug === love.memberId)
    : null;

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden">
      {/* All 7 Members Background Image Atmosphere */}
      <div className="fixed inset-0 pointer-events-none -z-20 select-none overflow-hidden" aria-hidden="true">
        <Image
          src="/images/members/all_members.jpg"
          alt="All Seven Members of ENHYPEN"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-100 opacity-40 dark:opacity-45 transition-opacity duration-700"
        />
        {/* Soft atmospheric gradient masks for clear photo visibility while protecting text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFF5F7]/45 via-[#FFFDF9]/55 to-[#FFFDF9]/70 dark:from-[#181018]/50 dark:via-[#120B13]/60 dark:to-[#0F0810]/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(255,253,249,0.5)_95%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(18,11,19,0.6)_95%)]" />
      </div>

      <Navbar />

      <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 mx-auto max-w-2xl w-full space-y-10">
        {/* Page Header with 3D Heart */}
        <div className="text-center space-y-3">
          {/* 3D Glossy Candy Heart */}
          <DailyLove3DSceneLazy />

          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 px-4 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 shadow-xs">
            <Heart className="h-3.5 w-3.5 fill-rose-500" />
            <span>Random ENGENE Love</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            Need a little{' '}
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 dark:from-rose-400 dark:via-pink-300 dark:to-purple-300 bg-clip-text text-transparent">
              ENGENE love
            </span>{' '}
            today?
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-lg mx-auto leading-relaxed">
            Read a random warm note from another ENGENE or write your own appreciation message directly below!
          </p>
        </div>

        {/* SECTION 1: RANDOM LOVE DISCOVERY CARD */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Today&apos;s Random Heartwarming Note</span>
            </h2>
            {!loading && (
              <button
                onClick={handleAnother}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-300 hover:text-rose-700 dark:hover:text-rose-200 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100/80 dark:hover:bg-rose-900/60 border border-transparent dark:border-rose-900/50 px-3 py-1.5 rounded-full transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isRefreshing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCcw className="h-3 w-3" />
                )}
                <span>Draw Another ↻</span>
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-3xl border border-rose-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm shadow-sm">
              <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 animate-pulse">
                Finding a love note for you...
              </span>
            </div>
          )}

          {/* Empty State */}
          {!loading && empty && (
            <div className="rounded-3xl border border-rose-100 dark:border-zinc-800 bg-gradient-to-br from-rose-50 to-amber-50 dark:from-zinc-900 dark:to-zinc-950 p-8 text-center space-y-3 shadow-sm">
              <div className="text-4xl">💌</div>
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                No love notes in this drawer yet
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
                Type your appreciation message below to be the first!
              </p>
            </div>
          )}

          {/* Love Card with 3D Tilt & Layer Depth */}
          {!loading && love && (
            <div className="relative group">
              {/* Glow backdrop */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-rose-200/40 via-purple-200/30 to-amber-200/40 dark:from-rose-600/20 dark:via-purple-600/15 dark:to-pink-600/20 blur-xl -z-10 scale-105 transition-all group-hover:scale-110" />

              <TiltCard
                maxTilt={10}
                perspective={1000}
                glowAccent="rgba(244, 63, 94, 0.35)"
                className="rounded-3xl border border-rose-100/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="space-y-5" style={{ transformStyle: 'preserve-3d' }}>
                  {/* Member header badge with clickable link to member profile */}
                  <div style={{ transform: 'translateZ(24px)' }}>
                    {memberData ? (
                      <Link
                        href={`/members/${memberData.slug}`}
                        className="inline-flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-rose-50/80 dark:bg-zinc-800/80 hover:bg-rose-100/80 dark:hover:bg-zinc-700/80 border border-rose-100 dark:border-zinc-700 transition-all group/member shadow-xs"
                        title={`View ${memberData.displayName}'s Profile`}
                      >
                        <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-rose-200 dark:border-rose-900 shadow-xs">
                          <Image
                            src={memberData.image}
                            alt={memberData.displayName}
                            fill
                            className="object-cover"
                            style={{ objectPosition: memberData.imagePosition || 'center 20%' }}
                            sizes="40px"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 group-hover/member:text-rose-600 dark:group-hover/member:text-rose-400 transition-colors">
                              For {memberData.displayName}
                            </p>
                            <ExternalLink className="h-3 w-3 text-zinc-400 dark:text-zinc-500 group-hover/member:text-rose-600 dark:group-hover/member:text-rose-400" />
                          </div>
                          <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                            {memberData.koreanName}{memberData.role ? ` • ${memberData.role}` : ''}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <Link
                        href="/members"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-zinc-800 hover:bg-rose-100 dark:hover:bg-zinc-700 text-xs font-bold text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-zinc-700 transition-all shadow-xs"
                      >
                        <Users className="h-3.5 w-3.5 text-rose-500" />
                        <span>For ENHYPEN (All Seven)</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>

                  {/* Quote content */}
                  <div className="relative pl-6 py-1" style={{ transform: 'translateZ(18px)' }}>
                    <Quote className="absolute left-0 top-0 h-5 w-5 text-rose-300 dark:text-rose-500/70" />
                    <p className="text-base sm:text-lg text-zinc-800 dark:text-zinc-100 leading-relaxed font-medium italic">
                      {love.content}
                    </p>
                  </div>

                  {/* Author & User Profile Link */}
                  <div
                    className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4"
                    style={{ transform: 'translateZ(20px)' }}
                  >
                    <Link
                      href={`/profile/${encodeURIComponent(love.userName)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors group/user"
                      title={`View ${love.userName}'s profile`}
                    >
                      <UserIcon className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 group-hover/user:text-rose-500" />
                      <span>— {love.userName}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover/user:opacity-100 group-hover/user:translate-x-0 transition-all text-rose-500" />
                    </Link>

                    {love.likesCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-transparent dark:border-rose-900/50 px-2.5 py-1 rounded-full">
                        <Heart className="h-3 w-3 fill-rose-500" />
                        {love.likesCount}
                      </span>
                    )}
                  </div>
                </div>
              </TiltCard>
            </div>
          )}
        </div>

        {/* SECTION 2: INLINE "TYPE HERE DIRECTLY" COMPOSER */}
        <div className="rounded-3xl border border-rose-100 dark:border-zinc-800 bg-gradient-to-br from-white via-rose-50/30 to-amber-50/40 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 sm:p-8 shadow-md space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <PenLine className="h-3.5 w-3.5" />
              <span>Leave Your Own Message</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">
              Write an Appreciation Note 💌
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Type your note below. Choosing a member will publish to their <strong>Profile Wall</strong> and take you to their profile! Choosing All 7 will post to the <strong>Feed</strong>!
            </p>
          </div>

          {/* Member Picker: All 7 or Individual Member */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Who is this message for?</label>
            <div className="flex flex-wrap gap-2">
              {/* Option: All 7 */}
              <button
                type="button"
                onClick={() => setSelectedMember('all')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  selectedMember === 'all'
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm ring-2 ring-rose-300 dark:ring-rose-800'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-500/60 hover:bg-rose-50/50 dark:hover:bg-zinc-700'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>All 7 (ENHYPEN)</span>
              </button>

              {/* 7 Individual Members */}
              {MEMBERS_DATA.map((m) => {
                const isSelected = selectedMember === m.slug;
                return (
                  <button
                    key={m.slug}
                    type="button"
                    onClick={() => setSelectedMember(m.slug)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-300 dark:ring-rose-800'
                        : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-500/60 hover:bg-rose-50/50 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <div className="relative h-5 w-5 rounded-full overflow-hidden">
                      <Image src={m.image} alt={m.displayName} fill className="object-cover" style={{ objectPosition: m.imagePosition || 'center 20%' }} />
                    </div>
                    <span>{m.displayName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Area to type directly */}
          <div className="space-y-1.5">
            <textarea
              rows={4}
              maxLength={1000}
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                if (postError) setPostError(null);
              }}
              placeholder={
                selectedMember === 'all'
                  ? 'Write your heartfelt message, encouragement, or love for all seven members...'
                  : `Write your heartfelt message, thank-you note, or cheer for ${
                      MEMBERS_DATA.find((m) => m.slug === selectedMember)?.displayName || selectedMember
                    }...`
              }
              className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/90 p-4 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200/50 dark:focus:ring-rose-900/40 resize-none transition-all"
            />
            <div className="flex justify-between items-center text-[11px] text-zinc-400 dark:text-zinc-500 px-1">
              <span>Kind words and respectful appreciation only ✨</span>
              <span>{1000 - messageText.length} left</span>
            </div>
          </div>

          {/* Error Message */}
          {postError && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 p-3 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {postError}
            </div>
          )}

          {/* Direct Post Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isPosting}
              onClick={handleSendMessage}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-md hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isPosting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>
                {selectedMember === 'all'
                  ? 'Post to Feed & Community →'
                  : `Post Appreciation for ${
                      MEMBERS_DATA.find((m) => m.slug === selectedMember)?.displayName || selectedMember
                    } & View Member Profile →`}
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Notification Toast */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <Footer />
    </div>
  );
}
