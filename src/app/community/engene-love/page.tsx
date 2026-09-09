'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/ui/Toast';
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
  const { data: session } = useSession();

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
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 mx-auto max-w-2xl w-full space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 border border-rose-200 px-4 py-1.5 text-xs font-bold text-rose-700">
            <Heart className="h-3.5 w-3.5 fill-rose-500" />
            <span>Random ENGENE Love</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
            💌 Need a little ENGENE love today?
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-lg mx-auto leading-relaxed">
            Read a random warm note from another ENGENE or write your own appreciation message directly below!
          </p>
        </div>

        {/* SECTION 1: RANDOM LOVE DISCOVERY CARD */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Today&apos;s Random Heartwarming Note</span>
            </h2>
            {!loading && (
              <button
                onClick={handleAnother}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-3 py-1.5 rounded-full transition-all disabled:opacity-50 cursor-pointer"
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
            <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-3xl border border-rose-100 bg-white/60 backdrop-blur-sm shadow-sm">
              <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
              <span className="text-sm font-semibold text-zinc-500 animate-pulse">
                Finding a love note for you...
              </span>
            </div>
          )}

          {/* Empty State */}
          {!loading && empty && (
            <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-amber-50 p-8 text-center space-y-3 shadow-sm">
              <div className="text-4xl">💌</div>
              <h3 className="text-base font-black text-zinc-900">
                No love notes in this drawer yet
              </h3>
              <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                Type your appreciation message below to be the first!
              </p>
            </div>
          )}

          {/* Love Card */}
          {!loading && love && (
            <div className="relative group">
              {/* Glow backdrop */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-rose-200/40 via-purple-200/30 to-amber-200/40 blur-xl -z-10 scale-105 transition-all group-hover:scale-110" />

              <div className="rounded-3xl border border-white/80 bg-white/90 backdrop-blur-md p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all space-y-5">
                {/* Member header badge with clickable link to member profile */}
                {memberData ? (
                  <Link
                    href={`/members/${memberData.slug}`}
                    className="inline-flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-rose-50/80 hover:bg-rose-100/80 border border-rose-100 transition-all group/member"
                    title={`View ${memberData.displayName}'s Profile`}
                  >
                    <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-rose-200 shadow-xs">
                      <Image
                        src={memberData.image}
                        alt={memberData.displayName}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-extrabold text-zinc-900 group-hover/member:text-rose-600 transition-colors">
                          For {memberData.displayName}
                        </p>
                        <ExternalLink className="h-3 w-3 text-zinc-400 group-hover/member:text-rose-600" />
                      </div>
                      <p className="text-[10px] font-semibold text-zinc-500">
                        {memberData.koreanName} • {memberData.role}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <Link
                    href="/members"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 transition-all"
                  >
                    <Users className="h-3.5 w-3.5 text-rose-500" />
                    <span>For ENHYPEN (All Seven)</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}

                {/* Quote content */}
                <div className="relative pl-6 py-1">
                  <Quote className="absolute left-0 top-0 h-5 w-5 text-rose-300" />
                  <p className="text-base sm:text-lg text-zinc-800 leading-relaxed font-medium italic">
                    {love.content}
                  </p>
                </div>

                {/* Author & User Profile Link */}
                <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                  <Link
                    href={`/profile/${encodeURIComponent(love.userName)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-rose-600 transition-colors group/user"
                    title={`View ${love.userName}'s profile`}
                  >
                    <UserIcon className="h-3.5 w-3.5 text-zinc-400 group-hover/user:text-rose-500" />
                    <span>— {love.userName}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover/user:opacity-100 group-hover/user:translate-x-0 transition-all text-rose-500" />
                  </Link>

                  {love.likesCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">
                      <Heart className="h-3 w-3 fill-rose-500" />
                      {love.likesCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: INLINE "TYPE HERE DIRECTLY" COMPOSER */}
        <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white via-rose-50/30 to-amber-50/40 p-6 sm:p-8 shadow-md space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-600">
              <PenLine className="h-3.5 w-3.5" />
              <span>Leave Your Own Message</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-zinc-900">
              Write an Appreciation Note 💌
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500">
              Type your note below. Choosing a member will publish to their <strong>Profile Wall</strong> and take you to their profile! Choosing All 7 will post to the <strong>Feed</strong>!
            </p>
          </div>

          {/* Member Picker: All 7 or Individual Member */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700">Who is this message for?</label>
            <div className="flex flex-wrap gap-2">
              {/* Option: All 7 */}
              <button
                type="button"
                onClick={() => setSelectedMember('all')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  selectedMember === 'all'
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm ring-2 ring-rose-300'
                    : 'bg-white text-zinc-700 border border-zinc-200 hover:border-rose-300 hover:bg-rose-50/50'
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
                        ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-300'
                        : 'bg-white text-zinc-700 border border-zinc-200 hover:border-rose-300 hover:bg-rose-50/50'
                    }`}
                  >
                    <div className="relative h-5 w-5 rounded-full overflow-hidden">
                      <Image src={m.image} alt={m.displayName} fill className="object-cover" />
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
              className="w-full rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200/50 resize-none transition-all"
            />
            <div className="flex justify-between items-center text-[11px] text-zinc-400 px-1">
              <span>Kind words and respectful appreciation only ✨</span>
              <span>{1000 - messageText.length} left</span>
            </div>
          </div>

          {/* Error Message */}
          {postError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
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
