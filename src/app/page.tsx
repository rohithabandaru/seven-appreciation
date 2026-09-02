// REFACTORED
'use client';
import React from 'react';
import FeedPageShell from '@/components/feed/FeedPageShell';
import CreatePostModal from '@/components/ui/CreatePostModal';
import Toast from '@/components/ui/Toast';
import ReportModal from '@/components/ui/ReportModal';
import { useFeedPage } from '@/hooks/useFeedPage';
import { PostCategory } from '@/types';
import { Heart } from 'lucide-react';

import SpotlightAndPrompt from '@/components/feed/SpotlightAndPrompt';

export default function Home() {
  const feed = useFeedPage('all');
  const [activePrompt, setActivePrompt] = React.useState<string | null>(null);

  const handlePromptClick = (promptText: string) => {
    setActivePrompt(promptText);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const header = (
    <div className="mb-3">
      <SpotlightAndPrompt onPromptClick={handlePromptClick} />
      <div className="py-3 text-center">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 mb-2">
          Celebrate Their Artistry.{' '}
          <span className="text-rose-500">Share Pure Love.</span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto">
          A warm, positive community to share appreciation notes, fan stories, memories, and art celebrating all seven members with kindness and respect.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <FeedPageShell
        header={header}
        posts={feed.posts}
        activeTab={feed.activeTab}
        setActiveTab={feed.setActiveTab}
        selectedMember={feed.selectedMember as string}
        setSelectedMember={feed.setSelectedMember as (member: string) => void}
        handleLike={feed.handleLike}
        handleAddComment={feed.handleAddComment}
        handleDeletePost={feed.handleDeletePost}
        handleDeleteComment={feed.handleDeleteComment}
        setPosts={feed.setPosts}
        setReportTarget={feed.setReportTarget as (target: { id: string; snippet: string }) => void}
        setToast={feed.setToast}
        setShowCreateModal={feed.setShowCreateModal}
        loadMorePosts={feed.loadMorePosts}
        hasMore={feed.hasMore}
        isLoadingMore={feed.isLoadingMore}
        isLoading={feed.isLoading}
        activePrompt={activePrompt}
        onClearPrompt={() => setActivePrompt(null)}
        emptyIcon={Heart}
        emptyTitle="No posts in this category yet"
        emptyDesc="Be the first to share an appreciation note, heartfelt memory, or fan project for this selection!"
        emptyBtnText="Write the First Post"
        emptyBtnColor="bg-rose-500 hover:bg-rose-600"
      />

      {feed.showCreateModal && (
        <CreatePostModal
          onClose={() => {
            feed.setShowCreateModal(false);
            setActivePrompt(null);
          }}
          defaultCategory={feed.activeTab !== 'all' ? (feed.activeTab as PostCategory) : 'Appreciation'}
          defaultMemberId={feed.selectedMember as 'all' | import('@/types').MemberSlug}
          defaultTitle={activePrompt ? activePrompt : ''}
          promptBanner={activePrompt || undefined}
          onPostCreated={(newPost) => {
            feed.setPosts([newPost, ...feed.posts]);
            setActivePrompt(null);
            feed.setToast({
              type: 'success',
              title: 'Post Published',
              message: 'Your post is now live in the community feed!'
            });
          }}
        />
      )}

      {feed.reportTarget && (
        <ReportModal
          contentType="post"
          contentId={feed.reportTarget.id}
          contentSnippet={feed.reportTarget.snippet}
          onClose={() => feed.setReportTarget(null)}
          onSubmitted={() => {
            feed.setToast({
              type: 'success',
              title: 'Report Submitted',
              message: 'Thank you for keeping our community safe and positive.'
            });
          }}
        />
      )}

      {feed.toast && (
        <Toast
          type={feed.toast.type}
          title={feed.toast.title}
          message={feed.toast.message}
          onClose={() => feed.setToast(null)}
        />
      )}
    </>
  );
}
