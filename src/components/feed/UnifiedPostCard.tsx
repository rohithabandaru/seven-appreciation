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
  ChevronUp,
  Trash2,
  AlertTriangle,
  Loader2
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
  onDeletePost?: (postId: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  onReport?: (postId: string, snippet: string) => void;
  onToast?: (toast: { type: 'success' | 'warning' | 'error'; title: string; message: string } | null) => void;
  isPriority?: boolean;
}

export default function UnifiedPostCard({
  post,
  currentUserId: propUserId,
  onLike,
  onAddComment,
  onDeletePost,
  onDeleteComment,
  onReport,
  onToast,
  isPriority = false
}: UnifiedPostCardProps) {
  const { data: session } = useSession();
  const currentUserId = propUserId || session?.user?.id || '';
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';
  const isPostAuthor = Boolean(currentUserId && post.userId === currentUserId);
  const canDeletePost = isPostAuthor || isAdmin;

  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(() => isItemSaved('post', post.id));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

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
      userName: session?.user?.name || 'Kind Supporter',
      userAvatar: session?.user?.image || null,
      content: commentText.trim(),
      createdAt: new Date().toISOString()
    };

    if (onAddComment) {
      onAddComment(post.id, newComment);
    }
    setCommentText('');
    setShowComments(true);
    if (onToast) {
      onToast({
        type: 'success',
        title: 'Reply Shared',
        message: 'Your reply has been posted!'
      });
    }
  };

  const handleDeletePostClick = async () => {
    if (!onDeletePost) return;
    setIsDeleting(true);
    try {
      await onDeletePost(post.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCommentClick = async (commentId: string) => {
    if (!onDeleteComment) return;
    setDeletingCommentId(commentId);
    try {
      await onDeleteComment(post.id, commentId);
    } finally {
      setDeletingCommentId(null);
    }
  };

  // Get category badge color style
  const getCategoryBadgeClass = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'appreciation':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'story':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'artwork':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'achievement':
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
      {/* Top Header: Author & Recipient & Category & Options */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <UserAvatar name={post.userName} image={post.userAvatar} size={42} />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-zinc-900">{post.userName}</span>
              {isPostAuthor && (
                <span className="rounded-md bg-rose-100 px-1.5 py-0.2 text-[10px] font-bold text-rose-700">
                  You
                </span>
              )}
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
                className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Dedicated to {memberObj.displayName}</span>
              </Link>
            ) : (
              <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-100">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>General / All Seven</span>
              </span>
            )}
          </div>
        </div>

        {/* Category Badge & Actions (Delete, Report) */}
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getCategoryBadgeClass(post.type ?? post.category ?? '')}`}>
            {post.type || post.category || 'General'}
          </span>

          {/* Delete Button (Owner or Admin) */}
          {canDeletePost && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-full p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Delete post"
              aria-label="Delete post"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          {/* Report Button */}
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

      {/* Delete Confirmation Banner */}
      {showDeleteConfirm && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50/90 p-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-red-800 font-medium">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-600" />
            <span>Are you sure you want to delete this post? This cannot be undone.</span>
          </div>
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="rounded-lg px-2.5 py-1 font-bold text-zinc-600 hover:bg-zinc-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeletePostClick}
              disabled={isDeleting}
              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1 font-bold text-white shadow-xs hover:bg-red-700 transition-colors"
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-2.5">
        {post.title && post.title !== 'Heartfelt Note' && post.title !== 'Community Share' && (
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
            priority={isPriority}
            className="object-cover transition-transform duration-500 hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 700px"
          />
        </div>
      )}

      {/* Interactive Action Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-rose-100/60 pt-4 text-xs font-semibold text-zinc-600">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Like Button */}
          <button
            onClick={() => onLike && onLike(post.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all cursor-pointer ${
              isLiked
                ? 'bg-rose-50 text-rose-600 shadow-xs scale-105 font-bold'
                : 'hover:bg-rose-50/70 hover:text-rose-600'
            }`}
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            <Heart className={`h-4 w-4 transition-transform active:scale-125 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{post.likesCount || 0}</span>
          </button>

          {/* Comments / Replies Toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors cursor-pointer ${
              showComments ? 'bg-amber-50 text-amber-700 font-bold' : 'hover:bg-zinc-100 hover:text-zinc-900'
            }`}
            aria-label={showComments ? "Hide replies" : "Show replies"}
          >
            <MessageSquare className="h-4 w-4 text-zinc-500" />
            <span>{post.comments?.length || post.commentsCount || 0}</span>
            <span className="hidden sm:inline">Replies</span>
          </button>
        </div>

        {/* Share & Bookmark */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleBookmarkToggle}
            className={`rounded-full p-2 transition-colors cursor-pointer ${
              isSaved ? 'bg-rose-50 text-rose-600' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'
            }`}
            title="Save post"
            aria-label={isSaved ? "Remove from saved" : "Save post"}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors cursor-pointer"
            title="Share post"
            aria-label="Share post"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Inline Comments / Replies Section */}
      {showComments && (
        <div className="mt-4 space-y-4 border-t border-zinc-100 pt-4 animate-in fade-in duration-200">
          {/* Add Reply Input Box */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2.5">
            <UserAvatar 
              name={session?.user?.name || 'You'} 
              image={session?.user?.image || null} 
              size={32} 
              className="flex-shrink-0"
            />
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post your reply..."
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/70 px-4 py-2.5 pr-10 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-rose-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="absolute right-1.5 flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
                aria-label="Submit reply"
                title="Post Reply"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          </form>

          {/* Comments / Replies List */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => {
                const isCommentAuthor = Boolean(currentUserId && comment.userId === currentUserId);
                const canDeleteComment = isCommentAuthor || isPostAuthor || isAdmin;
                const isThisCommentDeleting = deletingCommentId === comment.id;

                return (
                  <div key={comment.id} className="group/reply relative flex gap-3 rounded-2xl bg-zinc-50/90 p-3.5 text-xs transition-colors hover:bg-rose-50/30 border border-zinc-100">
                    <UserAvatar name={comment.userName} image={comment.userAvatar} size={30} className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-900">{comment.userName}</span>
                          {isCommentAuthor && (
                            <span className="rounded-sm bg-rose-100 px-1 text-[9px] font-bold text-rose-700">
                              You
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-400">•</span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(comment.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>

                        {/* Delete Comment Button */}
                        {canDeleteComment && (
                          <button
                            onClick={() => handleDeleteCommentClick(comment.id)}
                            disabled={isThisCommentDeleting}
                            className="opacity-0 group-hover/reply:opacity-100 text-zinc-400 hover:text-red-600 transition-all p-1 rounded-md hover:bg-red-50 cursor-pointer"
                            title="Delete reply"
                            aria-label="Delete reply"
                          >
                            {isThisCommentDeleting ? (
                              <Loader2 className="h-3 w-3 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-zinc-700 leading-relaxed break-words">{comment.content}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-xs text-zinc-400 py-3 italic">
                No replies yet. Be the first to start the conversation!
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
