import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import UnifiedPostCard from '@/components/feed/UnifiedPostCard';
import FeedSidebar from '@/components/feed/FeedSidebar';
import TwitterComposer from '@/components/feed/TwitterComposer';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import { Post, Comment } from '@/types';
import { Plus, Sparkles, Heart, BookOpen, Image as ImageIcon, MessageSquare, Loader2 } from 'lucide-react';

export const CATEGORY_TABS = [
  { id: 'all', label: 'All Feed', icon: Sparkles },
  { id: 'Appreciation', label: 'Appreciation Notes', icon: Heart },
  { id: 'Story', label: 'Stories & Memories', icon: BookOpen },
  { id: 'Artwork', label: 'Art & Projects', icon: ImageIcon },
  { id: 'Community', label: 'Discussions', icon: MessageSquare }
];

interface FeedPageShellProps {
  header: React.ReactNode;
  posts: Post[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedMember: string;
  setSelectedMember: (member: string) => void;
  handleLike: (postId: string) => void;
  handleAddComment: (postId: string, comment: Comment) => void;
  handleDeletePost?: (postId: string) => void;
  handleDeleteComment?: (postId: string, commentId: string) => void;
  setPosts?: React.Dispatch<React.SetStateAction<Post[]>>;
  setReportTarget: (target: { id: string; snippet: string }) => void;
  setToast: (toast: { type: 'success' | 'warning' | 'error'; title: string; message: string } | null) => void;
  setShowCreateModal: (show: boolean) => void;
  loadMorePosts?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  showTabs?: boolean;
  activePrompt?: string | null;
  onClearPrompt?: () => void;
  emptyIcon: React.ComponentType<{ className?: string }>;
  emptyTitle: string;
  emptyDesc: string;
  emptyBtnText: string;
  emptyBtnColor: string;
}

export default function FeedPageShell({
  header,
  posts,
  activeTab,
  setActiveTab,
  selectedMember,
  setSelectedMember,
  handleLike,
  handleAddComment,
  handleDeletePost,
  handleDeleteComment,
  setPosts,
  setReportTarget,
  setToast,
  setShowCreateModal,
  loadMorePosts,
  hasMore = false,
  isLoadingMore = false,
  showTabs = true,
  activePrompt,
  onClearPrompt,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDesc,
  emptyBtnText,
  emptyBtnColor,
}: FeedPageShellProps) {
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMorePosts || !hasMore || isLoadingMore) return;

    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMorePosts, hasMore, isLoadingMore]);
  
  const filteredPosts = posts.filter((p) => {
    const matchesTab = !showTabs || activeTab === 'all' || (p.type || p.category) === activeTab;
    const matchesMember = selectedMember === 'all' || p.memberId === selectedMember;
    return matchesTab && matchesMember;
  });

  const handlePostCreated = (newPost: Post) => {
    if (setPosts) {
      setPosts((prev) => [newPost, ...prev]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {header}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
            <div className="lg:col-span-8 space-y-6">
              
              {/* Twitter / X Style Inline Composer */}
              <TwitterComposer
                onPostCreated={handlePostCreated}
                onToast={setToast}
                defaultMember={selectedMember}
                defaultCategory={activeTab}
                activePrompt={activePrompt}
                onClearPrompt={onClearPrompt}
              />

              {showTabs && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {CATEGORY_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold transition-all border cursor-pointer ${
                          isActive
                            ? 'border-rose-500 bg-rose-500 text-white shadow-xs'
                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-rose-200 hover:bg-rose-50/50'
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="rounded-2xl border border-rose-100/60 bg-white/70 p-3 shadow-2xs backdrop-blur-sm">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pl-1 flex-shrink-0">
                    Filter by:
                  </span>
                  
                  <button
                    onClick={() => setSelectedMember('all')}
                    className={`rounded-xl px-3 py-1 text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                      selectedMember === 'all'
                        ? 'border-rose-500 bg-rose-50 text-rose-700 font-extrabold ring-1 ring-rose-500'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    ✨ All Seven
                  </button>

                  {MEMBERS_DATA.map((member) => {
                    const isSelected = selectedMember === member.slug;
                    return (
                      <button
                        key={member.slug}
                        onClick={() => setSelectedMember(member.slug)}
                        className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold ring-1 ring-rose-500'
                            : 'border-zinc-200 bg-white text-zinc-700 hover:border-rose-200 hover:bg-rose-50/40'
                        }`}
                      >
                        <div className="relative h-4 w-4 overflow-hidden rounded-full border border-zinc-200">
                          <Image src={member.image} alt={member.displayName} fill className="object-cover" sizes="16px" />
                        </div>
                        <span>{member.displayName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                {filteredPosts.length > 0 ? (
                  <>
                    {filteredPosts.map((post) => (
                      <UnifiedPostCard
                        key={post.id}
                        post={post}
                        onLike={handleLike}
                        onAddComment={handleAddComment}
                        onDeletePost={handleDeletePost}
                        onDeleteComment={handleDeleteComment}
                        onReport={(id, snippet) => setReportTarget({ id, snippet })}
                        onToast={setToast}
                      />
                    ))}

                    {hasMore && (
                      <div ref={observerRef} className="py-6 flex flex-col items-center justify-center gap-2">
                        {isLoadingMore ? (
                          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 px-4 py-2 rounded-full border border-rose-200 shadow-2xs animate-pulse">
                            <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                            <span>Loading more appreciation posts...</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => loadMorePosts && loadMorePosts()}
                            className="text-xs font-bold text-zinc-500 hover:text-rose-600 bg-white px-4 py-2 rounded-full border border-zinc-200 hover:border-rose-300 transition-all shadow-2xs cursor-pointer"
                          >
                            Load More Posts &darr;
                          </button>
                        )}
                      </div>
                    )}

                    {!hasMore && filteredPosts.length > 0 && (
                      <div className="py-6 text-center text-xs text-zinc-400 font-medium">
                        ✨ You&apos;re all caught up with community appreciation!
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-3xl border border-dashed border-rose-200 bg-white/80 p-12 text-center shadow-xs">
                    <EmptyIcon className="mx-auto h-12 w-12 text-rose-300 stroke-1" />
                    <h3 className="mt-3 text-base font-bold text-zinc-800">{emptyTitle}</h3>
                    <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                      {emptyDesc}
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className={`mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer ${emptyBtnColor}`}
                    >
                      <Plus className="h-4 w-4" />
                      <span>{emptyBtnText}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4">
              <FeedSidebar />
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
