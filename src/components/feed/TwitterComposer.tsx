'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Sparkles,
  Image as ImageIcon,
  X,
  Loader2,
  Send, 
  Heart, 
  BookOpen, 
  MessageSquare,
  AlertCircle,
  LogIn
} from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import { checkContentModeration } from '@/lib/moderation';
import { Post, PostCategory, MemberSlug } from '@/types';

interface TwitterComposerProps {
  onPostCreated?: (newPost: Post) => void;
  onToast?: (toast: { type: 'success' | 'warning' | 'error'; title: string; message: string }) => void;
  defaultMember?: string;
  defaultCategory?: string;
  activePrompt?: string | null;
  onClearPrompt?: () => void;
}

const CATEGORIES: { id: PostCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'Appreciation', label: 'Appreciation', icon: Heart },
  { id: 'Story', label: 'Story', icon: BookOpen },
  { id: 'Artwork', label: 'Art / Media', icon: ImageIcon },
  { id: 'Community', label: 'Discussion', icon: MessageSquare },
];

export default function TwitterComposer({
  onPostCreated,
  onToast,
  defaultMember = 'all',
  defaultCategory = 'Appreciation',
  activePrompt,
  onClearPrompt
}: TwitterComposerProps) {
  const { data: session } = useSession();
  const [isFocused, setIsFocused] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>(defaultMember === 'all' ? 'none' : defaultMember);
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>(
    (defaultCategory !== 'all' ? defaultCategory : 'Appreciation') as PostCategory
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxLength = 1000;
  const remainingChars = maxLength - content.length;
  const isOverLimit = remainingChars < 0;

  const [changedPrompt, setChangedPrompt] = useState(activePrompt ?? '');

  if (activePrompt && activePrompt !== changedPrompt) {
    setChangedPrompt(activePrompt);
    setTitle(activePrompt);
    setShowTitleInput(true);
    setIsFocused(true);
  }

  useEffect(() => {
    if (isFocused) {
      textareaRef.current?.focus();
    }
  }, [isFocused]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting || isOverLimit) return;

    if (!session?.user) {
      if (onToast) {
        onToast({
          type: 'warning',
          title: 'Sign In Required',
          message: 'Please sign in to publish posts on the community feed.'
        });
      }
      return;
    }

    setErrorMsg(null);

    // Run moderation check
    const modContent = checkContentModeration(content);
    const modTitle = title.trim() ? checkContentModeration(title) : { isAllowed: true, guidanceMessage: undefined };

    if (!modContent.isAllowed || !modTitle.isAllowed) {
      const guidance = modContent.guidanceMessage || modTitle.guidanceMessage || 'Message contains prohibited content.';
      setErrorMsg(guidance);
      if (onToast) {
        onToast({
          type: 'warning',
          title: 'Kindness First',
          message: guidance
        });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const memberObj = MEMBERS_DATA.find((m) => m.slug === selectedMember);
      const postTitle = title.trim() || (selectedCategory === 'Appreciation' ? 'Heartfelt Note' : 'Community Share');

      const payload = {
        type: selectedCategory.toLowerCase(),
        title: postTitle,
        content: content.trim(),
        memberId: selectedMember !== 'none' ? selectedMember : null,
      };

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to publish post');
      }

      const createdData = await res.json();

      const newPost: Post = {
        id: createdData.id || `post-${Date.now()}`,
        memberId: selectedMember !== 'none' ? (selectedMember as MemberSlug) : undefined,
        memberName: memberObj ? memberObj.displayName : undefined,
        userId: session.user.id,
        userName: session.user.name || 'Kind Supporter',
        userAvatar: session.user.image || null,
        category: selectedCategory,
        type: selectedCategory.toLowerCase(),
        title: postTitle,
        content: content.trim(),
        imageUrl: undefined,
        status: 'approved',
        likesCount: 0,
        likedBy: [],
        commentsCount: 0,
        comments: [],
        createdAt: createdData.createdAt || new Date().toISOString()
      };

      // Clear form
      setContent('');
      setTitle('');
      setShowTitleInput(false);
      setIsFocused(false);
      if (onClearPrompt) onClearPrompt();

      if (onPostCreated) {
        onPostCreated(newPost);
      }

      if (onToast) {
        onToast({
          type: 'success',
          title: 'Post Published! ✨',
          message: 'Your post is now live in the fandom feed.'
        });
      }

      window.dispatchEvent(new CustomEvent('postCreated'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMsg(msg);
      if (onToast) {
        onToast({ type: 'error', title: 'Post Failed', message: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border transition-all duration-300 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md shadow-xs ${
      isFocused ? 'border-rose-300 dark:border-rose-500/50 ring-2 ring-rose-100 dark:ring-rose-900/40 shadow-md' : 'border-rose-100/80 dark:border-zinc-800 hover:border-rose-200 dark:hover:border-zinc-700'
    }`}>
      {/* Active Prompt Header Banner */}
      {activePrompt && (
        <div className="flex items-center justify-between bg-amber-50/90 dark:bg-amber-950/40 px-4 py-2 text-xs font-semibold text-amber-800 dark:text-amber-200 border-b border-amber-200/80 dark:border-amber-900/40">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
            <span className="truncate">Answering Prompt: &ldquo;{activePrompt}&rdquo;</span>
          </div>
          {onClearPrompt && (
            <button
              type="button"
              onClick={onClearPrompt}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 ml-2"
              title="Clear Prompt"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="p-4 sm:p-5">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3 sm:gap-4 items-start">
            <UserAvatar 
              name={session?.user?.name || 'You'} 
              image={session?.user?.image || null} 
              size={42} 
              className="flex-shrink-0 mt-0.5"
            />

            <div className="flex-1 min-w-0">
                {/* Optional Title Field */}
                {showTitleInput && (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Add a headline / topic (optional)..."
                    className="w-full mb-2.5 rounded-xl border border-rose-100 dark:border-zinc-700 bg-rose-50/30 dark:bg-zinc-800/80 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-rose-300 dark:focus:border-rose-500 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none"
                    maxLength={100}
                  />
                )}

                {/* Main Content Textarea */}
                <textarea
                  ref={textareaRef}
                  value={content}
                  onFocus={() => setIsFocused(true)}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="What's happening? Share thoughts, comeback hype, or fan love..."
                  rows={isFocused ? 3 : 2}
                  className="w-full resize-none border-0 bg-transparent p-0 text-sm sm:text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-0 leading-relaxed"
                  disabled={isSubmitting}
                />

                {/* Error Message */}
                {errorMsg && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50/80 dark:bg-rose-950/50 p-2 rounded-xl border border-rose-200 dark:border-rose-900/60">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Expandable Composer Controls */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-rose-100/60 dark:border-zinc-800 pt-3">
                  {/* Left side options: Tag, Category */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Title Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowTitleInput(!showTitleInput)}
                      className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors border cursor-pointer ${
                        showTitleInput
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                          : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750'
                      }`}
                    >
                      <span>Title</span>
                    </button>

                    {/* Optional Member Tag Dropdown */}
                    <div className="relative inline-flex items-center">
                      <select
                        value={selectedMember}
                        onChange={(e) => setSelectedMember(e.target.value)}
                        className="rounded-xl border border-zinc-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 focus:border-rose-300 dark:focus:border-rose-500 focus:outline-none cursor-pointer"
                        title="Tag a member (optional)"
                      >
                        <option value="none">✨ General / All Seven (No Tag)</option>
                        {MEMBERS_DATA.map((m) => (
                          <option key={m.slug} value={m.slug}>
                            ⭐ {m.displayName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Category Dropdown */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as PostCategory)}
                      className="rounded-xl border border-zinc-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 focus:border-rose-300 dark:focus:border-rose-500 focus:outline-none cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Right side: Character Count & Post Button */}
                  <div className="flex items-center gap-3 ml-auto">
                    {content.length > 0 && (
                      <span className={`text-[11px] font-bold ${
                        isOverLimit ? 'text-red-500' : remainingChars < 50 ? 'text-amber-500' : 'text-zinc-400'
                      }`}>
                        {remainingChars}
                      </span>
                    )}

                    {!session && (
                      <Link
                        href="/login"
                        className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:underline"
                      >
                        <LogIn className="h-3 w-3" />
                        <span>Sign In</span>
                      </Link>
                    )}

                    <button
                      type="submit"
                      disabled={!content.trim() || isSubmitting || isOverLimit}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:scale-102 hover:shadow-md disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Post</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
      </div>
    </div>
  );
}
