'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import UserAvatar from '@/components/ui/UserAvatar';
import { BADGE_DEFINITIONS } from '@/lib/badge-definitions';
import type { BadgeDefinition, BadgeType } from '@/types';
import {
  Sunrise,
  Flame,
  Heart,
  Send,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';

interface TodayData {
  prompt: {
    id: string;
    date: string;
    question: string;
    category: string;
    memberId: string | null;
    isActive: boolean;
  };
  completed: boolean;
  userResponse: {
    id: string;
    message: string;
    createdAt: string;
  } | null;
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastCheckInDate: string | null;
    totalCheckIns: number;
  };
  communityCount: number;
  recentResponses: Array<{
    id: string;
    message: string;
    createdAt: string;
    user: { name: string; image: string | null };
  }>;
}

export default function DailyEngeneSection() {
  const { data: session, status } = useSession();
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCommunity, setShowCommunity] = useState(false);
  const [badgeCelebration, setBadgeCelebration] = useState<BadgeDefinition | null>(null);

  const fetchToday = useCallback(async () => {
    try {
      const res = await fetch('/api/daily/today');
      if (!res.ok) throw new Error('Could not load daily prompt');
      const data = await res.json();
      setTodayData(data);
    } catch {
      // Silently fail — section just doesn't render
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || submitting || !todayData) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/daily/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: todayData.prompt.id,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      // Show badge celebration if new badges were earned
      if (data.newBadges && data.newBadges.length > 0) {
        setBadgeCelebration(data.newBadges[data.newBadges.length - 1]);
      }

      // Refresh today data
      await fetchToday();
      setMessage('');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 via-rose-50/50 to-purple-50/40 p-6 mb-4 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 rounded-full bg-amber-200" />
          <div className="h-4 w-48 rounded-full bg-amber-200/60" />
        </div>
        <div className="h-4 w-full rounded-full bg-amber-100/80 mb-2" />
        <div className="h-4 w-3/4 rounded-full bg-amber-100/60" />
      </div>
    );
  }

  if (!todayData) return null;

  const { prompt, completed, userResponse, streak, communityCount, recentResponses } = todayData;
  const isAuthenticated = status === 'authenticated';
  const charsLeft = 750 - message.length;

  return (
    <>
      {/* Badge Celebration Modal */}
      {badgeCelebration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={() => setBadgeCelebration(null)}
        >
          <div
            className="relative max-w-sm w-full rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-8 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setBadgeCelebration(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-6xl animate-bounce">{badgeCelebration.icon}</div>
            <h3 className="text-xl font-black text-zinc-900">Badge Unlocked!</h3>
            <p className="text-base font-bold text-amber-700">{badgeCelebration.name}</p>
            <p className="text-sm text-zinc-600">{badgeCelebration.description}</p>
            <button
              onClick={() => setBadgeCelebration(null)}
              className="mt-2 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-3 text-xs font-bold text-white shadow-md hover:opacity-90 transition-opacity"
            >
              Celebrate! 🎉
            </button>
          </div>
        </div>
      )}

      {/* Daily ENGENE Section */}
      <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 via-rose-50/50 to-purple-50/40 p-5 sm:p-6 mb-4 space-y-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sunrise className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm sm:text-base font-black text-zinc-900">Today&apos;s ENGENE Moment</h2>
            {prompt.category && (
              <span className="hidden sm:inline-flex rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                {prompt.category}
              </span>
            )}
          </div>

          {/* Streak Badge */}
          {isAuthenticated && streak.currentStreak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-100 border border-orange-200 px-2.5 py-1 text-[11px] font-bold text-orange-700">
              <Flame className="h-3.5 w-3.5" />
              <span>{streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Prompt Question */}
        <p className="text-sm sm:text-base font-semibold text-zinc-800 leading-relaxed italic">
          &ldquo;{prompt.question}&rdquo;
        </p>

        {/* Community stats bar */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3 w-3 text-rose-400" />
            {communityCount} ENGENE{communityCount !== 1 ? 's' : ''} checked in today
          </span>
        </div>

        {/* Check-in Form (not completed, authenticated) */}
        {isAuthenticated && !completed && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= 750) setMessage(e.target.value);
                }}
                placeholder="Share your warm thoughts..."
                rows={3}
                className="w-full rounded-2xl border border-amber-200 bg-white/80 p-4 text-sm text-zinc-800 placeholder-zinc-400 resize-none focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200/50 transition-all"
                disabled={submitting}
              />
              <span
                className={`absolute bottom-3 right-3 text-[10px] font-bold ${charsLeft < 50 ? 'text-rose-500' : 'text-zinc-300'}`}
              >
                {charsLeft}
              </span>
            </div>

            {error && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!message.trim() || submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Check In</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Not authenticated prompt */}
        {!isAuthenticated && !completed && (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sign in to check in today</span>
          </Link>
        )}

        {/* Completed State */}
        {completed && userResponse && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-bold">You checked in today 🤍</span>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-sm text-zinc-700 leading-relaxed">
              &ldquo;{userResponse.message}&rdquo;
            </div>

            {/* Streak info */}
            {streak.currentStreak > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-zinc-600">
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 border border-orange-200 px-2.5 py-1 text-orange-700">
                  <Flame className="h-3 w-3" /> {streak.currentStreak} day streak
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 border border-purple-200 px-2.5 py-1 text-purple-700">
                  🏆 Best: {streak.longestStreak}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-1 text-zinc-600">
                  Total: {streak.totalCheckIns}
                </span>
              </div>
            )}

            {/* Discovery Button */}
            <Link
              href="/community/engene-love"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-500 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 transition-all"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>💌 Give Me Something to Read</span>
            </Link>
          </div>
        )}

        {/* Community Responses Toggle */}
        {communityCount > 0 && (
          <div>
            <button
              onClick={() => setShowCommunity(!showCommunity)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors"
            >
              {showCommunity ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              <span>{showCommunity ? 'Hide' : 'See'} community responses</span>
            </button>

            {showCommunity && (
              <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto rounded-2xl border border-zinc-200 bg-white/60 p-3">
                {recentResponses.map((resp) => (
                  <div
                    key={resp.id}
                    className="flex gap-3 rounded-xl bg-white p-3 border border-zinc-100 shadow-2xs"
                  >
                    <div className="flex-shrink-0 h-7 w-7 rounded-full overflow-hidden">
                      <UserAvatar name={resp.user.name} image={resp.user.image} size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-zinc-700 mb-0.5">{resp.user.name}</p>
                      <p className="text-xs text-zinc-600 leading-relaxed">{resp.message}</p>
                    </div>
                  </div>
                ))}
                {recentResponses.length === 0 && (
                  <p className="text-xs text-zinc-400 text-center py-4">No responses yet. Be the first!</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
