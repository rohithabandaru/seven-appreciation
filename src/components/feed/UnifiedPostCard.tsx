'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Share2, 
  ShieldAlert, 
  Sparkles, 
  Send, 
  Check, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Post, Comment } from '@/types';
import UserAvatar from '@/components/ui/UserAvatar';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import { toggleSavedItem, isItemSaved } from '@/lib/storage';
import { checkContentModeration } from '@/lib/moderation';
import { useSession } from 'next-auth/react';

interface UnifiedPostCardProps {
  post: Post;
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onAddComment?: (postId: string, comment: Comment) => void;
  onReport?: (postId: string, snippet: string) => void;
  onToast?: (toast: { type: 'success' | 'warning' | 'error'; title: string; message: string }) => void;
}

export default function UnifiedPostCard({
  post,
  currentUserId: propUserId,
  onLike,
  onAddComment,
  onReport,
  onToast
}: UnifiedPostCardProps) {
  const { data: session } = useSession();
  const currentUserId = propUserId || session?.user?.id || '';
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(() => isItemSaved('post', post.id));

  const isLiked = post.likedBy?.includes(currentUserId);
  const memberObj = post.memberId ? MEMBERS_DATA.find((m) => m.slug === post.memberId) : null;

  const safeContent = post.content ?? '';
  const isLongContent = safeContent.length > 280;
  const displayContent = isLongContent && !isExpanded 
    ? `${safeContent.slice(0, 280)}...` 
    : safeContent;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/#${post.id}`);
      setCopied(true);
      if (onToast) {
        onToast({
          type: 'success',
          title: 'Link Copied',
          message: 'Post link copied to your clipboard!'
        });
      }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBookmarkToggle = () => {
    toggleSavedItem('post', post.id);
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    if (onToast) {
      onToast({
        type: 'success',
        title: nextSaved ? 'Saved to Collection' : 'Removed from Saved',
        message: nextSaved ? 'Post saved to your bookmarks.' : 'Post removed from your bookmarks.'
      });
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const modResult = checkContentModeration(commentText);
    if (!modResult.isAllowed) {
      if (onToast) {
        onToast({
          type: 'warning',
          title: 'Kindness First',
          message: modResult.guidanceMessage || 'Please ensure comments support our community principles.'
        });
      }
      return;
    }

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      postId: post.id,
      userId: currentUserId,
      userName: 'Kind Supporter',
      userAvatar: null,
      content: commentText.trim(),
      createdAt: new Date().toISOString()
    };

    if (onAddComment) {
      onAddComment(post.id, newComment);
    }
    setCommentText('');
    if (onToast) {
      onToast({
        type: 'success',
        title: 'Comment Shared',
        message: 'Your uplifting thought has been posted!'
      });
    }
  };

  // Get category badge color style
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Appreciation':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'Story':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'Artwork':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'Achievement':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <article
      id={post.id}
      className="group relative overflow-hidden rounded-3xl border border-rose-100/70 bg-white/90 p-5 sm:p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-md hover:border-rose-200"
    >
      {/* Top Header: Author & Recipient & Category */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <UserAvatar name={post.userName} image={post.userAvatar} size={40} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-zinc-900">{post.userName}</span>
              <span className="text-xs text-zinc-400">•</span>
              <span className="text-xs text-zinc-500">
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

            {/* Member Dedication Pill */}
            {memberObj ? (
              <Link 
                href={`/members/${memberObj.slug}`}
                className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Dedicated to {memberObj.displayName}</span>
              </Link>
            ) : (
              <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-zinc-500">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Dedicated to All Seven</span>
              </span>
            )}
          </div>
        </div>

        {/* Category Badge & Report Action */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getCategoryBadgeClass(post.type ?? post.category ?? '')}`}>
            {post.type || post.category}
          </span>
          {onReport && (
            <button
              onClick={() => onReport(post.id, post.title || post.content)}
              className="rounded-full p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              title="Report content"
              aria-label="Report content"
            >
              <ShieldAlert className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-2.5">
        {post.title && (
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 leading-snug">
            {post.title}
          </h3>
        )}

        <div className="text-sm sm:text-base text-zinc-700 leading-relaxed whitespace-pre-line">
          {displayContent}
        </div>

        {isLongContent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 pt-1"
          >
            <span>{isExpanded ? 'Show less' : 'Read full story'}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Optional Attached Media */}
      {post.imageUrl && (
        <div className="relative mt-4 h-64 sm:h-80 w-full overflow-hidden rounded-2xl border border-rose-100/50 bg-zinc-100">
          <Image
            src={post.imageUrl}
            alt={post.title || 'Post image'}
            fill
            className="object-cover transition-transform duration-500 hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 700px"
          />
        </div>
      )}

      {/* Interactive Action Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-rose-100/60 pt-4 text-xs font-semibold text-zinc-600">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={() => onLike && onLike(post.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all ${
              isLiked
                ? 'bg-rose-50 text-rose-600 shadow-xs scale-105'
                : 'hover:bg-rose-50/70 hover:text-rose-600'
            }`}
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            <Heart className={`h-4 w-4 transition-transform active:scale-125 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{post.likesCount || 0}</span>
          </button>

          {/* Comments Toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors ${
              showComments ? 'bg-amber-50 text-amber-700' : 'hover:bg-zinc-100 hover:text-zinc-900'
            }`}
            aria-label={showComments ? "Hide comments" : "Show comments"}
          >
            <MessageSquare className="h-4 w-4 text-zinc-500" />
            <span>{post.comments?.length || post.commentsCount || 0}</span>
          </button>
        </div>

        {/* Share & Bookmark */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleBookmarkToggle}
            className={`rounded-full p-2 transition-colors ${
              isSaved ? 'bg-rose-50 text-rose-600' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'
            }`}
            title="Save post"
            aria-label={isSaved ? "Remove from saved" : "Save post"}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
            title="Share post"
            aria-label="Share post"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Inline Comments Section */}
      {showComments && (
        <div className="mt-4 space-y-4 border-t border-zinc-100 pt-4">
          {/* Comments List */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5 rounded-2xl bg-zinc-50/80 p-3 text-xs">
                  <UserAvatar name={comment.userName} image={comment.userAvatar} size={28} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900">{comment.userName}</span>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(comment.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-zinc-700 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-zinc-400 py-2 italic">
                Be the first to share an encouraging reply!
              </p>
            )}
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Leave a kind comment..."
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-rose-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
              aria-label="Submit comment"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
