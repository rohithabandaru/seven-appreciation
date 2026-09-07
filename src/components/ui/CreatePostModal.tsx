'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Loader2,
  Sparkles,
  Heart,
  BookOpen,
  Image as ImageIcon,
  MessageSquare,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import { checkContentModeration } from '@/lib/moderation';
import { Post, PostCategory, MemberSlug } from '@/types';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated?: (newPost: Post) => void;
  defaultCategory?: PostCategory;
  defaultMemberId?: MemberSlug | 'all';
  defaultTitle?: string;
  defaultContent?: string;
  promptBanner?: string;
}

const CATEGORY_OPTIONS: { id: PostCategory; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  {
    id: 'Appreciation',
    label: 'Appreciation Note',
    icon: Heart,
    description: 'Send heartfelt gratitude, cheer, and positive vibes'
  },
  {
    id: 'Story',
    label: 'Story / Memory',
    icon: BookOpen,
    description: 'Share a meaningful moment or personal inspiration'
  },
  {
    id: 'Artwork',
    label: 'Artwork & Fan Project',
    icon: ImageIcon,
    description: 'Showcase drawings, edits, letters, or creative projects'
  },
  {
    id: 'Community',
    label: 'Community Discussion',
    icon: MessageSquare,
    description: 'Start a warm, friendly conversation with supporters'
  }
];

export default function CreatePostModal({
  onClose,
  onPostCreated,
  defaultCategory = 'Appreciation',
  defaultMemberId = 'all',
  defaultTitle = '',
  defaultContent = '',
  promptBanner
}: CreatePostModalProps) {
  const { data: session } = useSession();

  const [category, setCategory] = useState<PostCategory>(defaultCategory);
  const [selectedMember, setSelectedMember] = useState<string>(defaultMemberId === 'all' ? 'none' : defaultMemberId);
  const [title, setTitle] = useState(defaultTitle);
  const [content, setContent] = useState(defaultContent);
  const [authorName] = useState(session?.user?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);

  const handleContentChange = (val: string) => {
    setContent(val);
    if (moderationError) setModerationError(null);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (moderationError) setModerationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModerationError(null);

    // 1. Run Content Moderation
    const checkTitle: Pick<import('@/types').ModerationCheckResult, 'isAllowed' | 'guidanceMessage'> = title.trim() ? checkContentModeration(title) : { isAllowed: true };
    const checkBody = checkContentModeration(content);

    if (!checkTitle.isAllowed || !checkBody.isAllowed) {
      setModerationError(
        checkTitle.guidanceMessage ||
        checkBody.guidanceMessage ||
        'Message contains terms that conflict with our positive community rules.'
      );
      return;
    }

    if (!session || !session.user) {
      setModerationError('You must be signed in to create a post. Please sign in to continue.');
      return;
    }

    setIsSubmitting(true);

    try {
      const memberObj = MEMBERS_DATA.find((m) => m.slug === selectedMember);

      const payload: Record<string, unknown> = {
        type: category.toLowerCase(),
        title: title.trim() || (category === 'Appreciation' ? 'Heartfelt Note' : 'Community Share'),
        content: content.trim(),
        memberId: selectedMember !== 'none' ? selectedMember : null,
      };

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setModerationError('You must be signed in to create a post. Please sign in to continue.');
          return;
        }
        const errorData = await res.json().catch(() => ({}));
        setModerationError(errorData.error || 'Failed to create post. Please try again.');
        return;
      }

      const createdData = await res.json();

      const newPost: Post = {
        id: createdData.id || `post-${Date.now()}`,
        memberId: selectedMember !== 'none' ? (selectedMember as MemberSlug) : undefined,
        memberName: memberObj ? memberObj.displayName : undefined,
        userId: session?.user?.id || 'anonymous',
        userName: authorName.trim() || session?.user?.name || 'Kind Supporter',
        userAvatar: session?.user?.image || null,
        category,
        title: payload.title as string,
        content: content.trim(),
        imageUrl: undefined,
        status: 'approved',
        likesCount: 0,
        likedBy: [],
        commentsCount: 0,
        comments: [],
        createdAt: createdData.createdAt || new Date().toISOString()
      };

      if (onPostCreated) {
        onPostCreated(newPost);
      }

      window.dispatchEvent(new CustomEvent('postCreated'));

      onClose();
    } catch {
      setModerationError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-rose-100">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-rose-500 fill-rose-400" />
              <span>Share Appreciation</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Share something kind and genuine.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {promptBanner && (
          <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span>Answering Prompt: &ldquo;{promptBanner}&rdquo;</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* 1. Category Selection Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
              1. What would you like to share?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center rounded-2xl p-3 text-center border transition-all ${isSelected
                        ? 'border-rose-500 bg-rose-50/70 text-rose-700 font-bold shadow-xs'
                        : 'border-zinc-200/80 bg-white text-zinc-600 hover:border-rose-200 hover:bg-zinc-50'
                      }`}
                  >
                    <Icon className={`h-5 w-5 mb-1.5 ${isSelected ? 'text-rose-500' : 'text-zinc-400'}`} />
                    <span className="text-xs leading-tight">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Recipient / Dedication */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
              2. Dedicate To
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedMember('none')}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold border transition-all ${selectedMember === 'none'
                    ? 'border-rose-500 bg-rose-500 text-white shadow-xs'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                  }`}
              >
                ✨ General / All Seven (No Tag)
              </button>
              {MEMBERS_DATA.map((member) => (
                <button
                  type="button"
                  key={member.slug}
                  onClick={() => setSelectedMember(member.slug)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${selectedMember === member.slug
                      ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold ring-1 ring-rose-500'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:border-rose-200 hover:bg-rose-50/30'
                    }`}
                >
                  <div className="relative h-4 w-4 overflow-hidden rounded-full border border-zinc-200">
                    <Image src={member.image} alt={member.displayName} fill className="object-cover" sizes="16px" />
                  </div>
                  <span>{member.displayName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Title (Optional for short notes, helpful for stories/art) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              3. Title <span className="text-[11px] font-normal text-zinc-400">({category === 'Appreciation' ? 'Optional' : 'Recommended'})</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={
                category === 'Story'
                  ? 'e.g., How watching their journey inspired me to study abroad'
                  : category === 'Artwork'
                    ? 'e.g., Watercolor portrait of Sunoo'
                    : 'A brief heading or summary...'
              }
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 outline-none focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500 transition-all"
            />
          </div>

          {/* 4. Message Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                4. Your Message / Story <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-zinc-400">{content.length} characters</span>
            </div>
            <textarea
              required
              rows={category === 'Story' ? 6 : 4}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={
                category === 'Appreciation'
                  ? 'Write your genuine note of gratitude, warm memories, or favorite performance...'
                  : category === 'Story'
                    ? 'Share your personal story and how their music or character touched your life...'
                    : 'Describe your creative project or thought...'
              }
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-sm text-zinc-900 outline-none focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500 resize-none transition-all"
            />
          </div>

          {/* Moderation / Auth Error Alert */}
          {moderationError && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">{!session?.user ? 'Authentication Required' : 'Guidelines Notice'}</p>
                <p className="mt-0.5 text-amber-700">{moderationError}</p>
                {!session?.user && (
                  <a
                    href="/login"
                    className="mt-2 inline-flex items-center gap-1 font-bold text-rose-600 hover:text-rose-700 underline"
                  >
                    Go to Sign In &rarr;
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Guidelines Mini Reminder */}
          <div className="flex items-center gap-2 rounded-2xl bg-zinc-50 p-3 text-xs text-zinc-500 border border-zinc-100">
            <ShieldCheck className="h-4 w-4 text-rose-500 flex-shrink-0" />
            <span>Reminder: All submissions must be respectful and free of negative comparisons or attacks.</span>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-200 transition-all hover:scale-102 hover:shadow-lg hover:shadow-rose-300 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Publish Post</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
