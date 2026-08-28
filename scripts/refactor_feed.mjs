import fs from 'fs';
import path from 'path';

const pagesToRefactor = [
  'src/app/page.tsx',
  'src/app/community/page.tsx',
  'src/app/stories/page.tsx',
  'src/app/appreciation/page.tsx'
];

pagesToRefactor.forEach(pagePath => {
  const fullPath = path.join('c:/Users/91784/seven-appreciation', pagePath);
  if (fs.existsSync(fullPath)) {
    
    // We will just replace the file contents entirely with the refactored versions to ensure correctness and avoid complex regex
    // since we know exactly what these pages do.

    if (pagePath === 'src/app/page.tsx') {
      fs.writeFileSync(fullPath, `// REFACTORED
'use client';
import React from 'react';
import Image from 'next/image';
import FeedPageShell from '@/components/feed/FeedPageShell';
import CreatePostModal from '@/components/ui/CreatePostModal';
import Toast from '@/components/ui/Toast';
import ReportModal from '@/components/ui/ReportModal';
import { useFeedPage } from '@/hooks/useFeedPage';
import { PostCategory } from '@/types';
import { Sparkles, Heart, Plus, SmilePlus } from 'lucide-react';

export default function Home() {
  const feed = useFeedPage('all');

  const header = (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-100/70 via-amber-50/60 to-purple-100/40 p-6 sm:p-10 border border-rose-200/60 shadow-xs mb-8">
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-white/90 px-3.5 py-1 text-xs font-bold text-rose-600 shadow-xs backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
          <span>Seven People. One Haven. Zero Competition.</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 leading-tight">
          Celebrate Their Artistry.{' '}
          <span className="gradient-text-warm block sm:inline">Share Pure Love.</span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          A warm, positive community to share appreciation notes, fan stories, memories, and art celebrating all seven members with kindness and respect.
        </p>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-rose-200/80 bg-white/95 p-2.5 shadow-sm backdrop-blur-md">
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-rose-100 bg-rose-50 hidden sm:block">
          <Image
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            alt="Avatar"
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>

        <button
          onClick={() => feed.setShowCreateModal(true)}
          className="w-full flex-1 rounded-xl bg-zinc-50/80 px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-zinc-400 hover:bg-rose-50/50 hover:text-zinc-600 transition-colors border border-zinc-100 flex items-center justify-between"
        >
          <span>Write an appreciation note, memory, or fan story...</span>
          <SmilePlus className="h-4 w-4 text-rose-400 hidden sm:block" />
        </button>

        <button
          onClick={() => feed.setShowCreateModal(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:scale-102 hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>Create Post</span>
        </button>
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
        setSelectedMember={feed.setSelectedMember as any}
        handleLike={feed.handleLike}
        handleAddComment={feed.handleAddComment}
        setReportTarget={feed.setReportTarget as any}
        setToast={feed.setToast}
        setShowCreateModal={feed.setShowCreateModal}
        emptyIcon={Heart}
        emptyTitle="No posts in this category yet"
        emptyDesc="Be the first to share an appreciation note, heartfelt memory, or fan project for this selection!"
        emptyBtnText="Write the First Post"
        emptyBtnColor="bg-rose-500 hover:bg-rose-600"
      />

      {feed.showCreateModal && (
        <CreatePostModal
          onClose={() => feed.setShowCreateModal(false)}
          defaultCategory={feed.activeTab !== 'all' ? (feed.activeTab as PostCategory) : 'Appreciation'}
          defaultMemberId={feed.selectedMember as any}
          onPostCreated={(newPost) => {
            feed.setPosts([newPost, ...feed.posts]);
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
`);
    }

    if (pagePath === 'src/app/community/page.tsx') {
      fs.writeFileSync(fullPath, `// REFACTORED
'use client';
import React from 'react';
import FeedPageShell from '@/components/feed/FeedPageShell';
import CreatePostModal from '@/components/ui/CreatePostModal';
import Toast from '@/components/ui/Toast';
import ReportModal from '@/components/ui/ReportModal';
import { useFeedPage } from '@/hooks/useFeedPage';
import { PostCategory } from '@/types';
import { Sparkles, Heart, Plus } from 'lucide-react';

export default function CommunityPage() {
  const feed = useFeedPage('all');

  const header = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100/80 pb-6 mb-8">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 mb-2 border border-rose-100">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Community Space</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
          Community Feed & Discussions
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Share kind words, artwork, stories, and concert memories in a peaceful atmosphere.
        </p>
      </div>

      <button
        onClick={() => feed.setShowCreateModal(true)}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-6 py-3 text-xs font-bold text-white shadow-md shadow-rose-200 hover:scale-102 transition-all self-start sm:self-auto"
      >
        <Plus className="h-4 w-4" />
        <span>Create Post</span>
      </button>
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
        setSelectedMember={feed.setSelectedMember as any}
        handleLike={feed.handleLike}
        handleAddComment={feed.handleAddComment}
        setReportTarget={feed.setReportTarget as any}
        setToast={feed.setToast}
        setShowCreateModal={feed.setShowCreateModal}
        emptyIcon={Heart}
        emptyTitle="No posts found"
        emptyDesc="Be the first to share in this category!"
        emptyBtnText="Write Post"
        emptyBtnColor="bg-rose-500 hover:bg-rose-600"
      />

      {feed.showCreateModal && (
        <CreatePostModal
          onClose={() => feed.setShowCreateModal(false)}
          defaultCategory={feed.activeTab !== 'all' ? (feed.activeTab as PostCategory) : 'Community'}
          defaultMemberId={feed.selectedMember as any}
          onPostCreated={(newPost) => {
            feed.setPosts([newPost, ...feed.posts]);
            feed.setToast({
              type: 'success',
              title: 'Post Published',
              message: 'Your post is now live!'
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
              message: 'Thank you for helping keep our haven safe.'
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
`);
    }

    if (pagePath === 'src/app/stories/page.tsx') {
      fs.writeFileSync(fullPath, `// REFACTORED
'use client';
import React from 'react';
import FeedPageShell from '@/components/feed/FeedPageShell';
import CreatePostModal from '@/components/ui/CreatePostModal';
import Toast from '@/components/ui/Toast';
import ReportModal from '@/components/ui/ReportModal';
import { useFeedPage } from '@/hooks/useFeedPage';
import { PostCategory } from '@/types';
import { BookOpen, Feather } from 'lucide-react';

export default function StoriesPage() {
  const feed = useFeedPage('Story');

  const header = (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-100 via-rose-50 to-amber-50 p-6 sm:p-10 border border-amber-200/60 shadow-xs mb-8">
      <div className="max-w-2xl space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1 text-xs font-bold text-amber-700 shadow-xs border border-amber-200">
          <BookOpen className="h-3.5 w-3.5 text-amber-600" />
          <span>Fan Journeys & Memories</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-tight">
          Stories of Inspiration
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
          Personal essays, memories, and reflections on how the members' dedication, resilience, and music bring hope into daily lives.
        </p>
      </div>

      <div className="mt-6">
        <button
          onClick={() => feed.setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 via-rose-600 to-rose-500 px-6 py-3 text-xs font-bold text-white shadow-md shadow-amber-200 hover:scale-102 transition-all"
        >
          <Feather className="h-4 w-4" />
          <span>Share Your Story</span>
        </button>
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
        setSelectedMember={feed.setSelectedMember as any}
        handleLike={feed.handleLike}
        handleAddComment={feed.handleAddComment}
        setReportTarget={feed.setReportTarget as any}
        setToast={feed.setToast}
        setShowCreateModal={feed.setShowCreateModal}
        showTabs={false} // Stories page doesn't show category tabs
        emptyIcon={BookOpen}
        emptyTitle="No stories written yet"
        emptyDesc="Have a memory or moment of inspiration to share? Write the first story!"
        emptyBtnText="Write Story"
        emptyBtnColor="bg-amber-600 hover:bg-amber-700"
      />

      {feed.showCreateModal && (
        <CreatePostModal
          onClose={() => feed.setShowCreateModal(false)}
          defaultCategory="Story"
          defaultMemberId={feed.selectedMember as any}
          onPostCreated={(newPost) => {
            feed.setPosts([newPost, ...feed.posts]);
            feed.setToast({
              type: 'success',
              title: 'Story Published',
              message: 'Your story has been shared with the community!'
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
              message: 'Thank you for keeping our haven safe.'
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
`);
    }

    if (pagePath === 'src/app/appreciation/page.tsx') {
      fs.writeFileSync(fullPath, `// REFACTORED
'use client';
import React from 'react';
import FeedPageShell from '@/components/feed/FeedPageShell';
import CreatePostModal from '@/components/ui/CreatePostModal';
import Toast from '@/components/ui/Toast';
import ReportModal from '@/components/ui/ReportModal';
import { useFeedPage } from '@/hooks/useFeedPage';
import { Heart, Plus } from 'lucide-react';

export default function AppreciationPage() {
  const feed = useFeedPage('Appreciation');

  const header = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100/80 pb-6 mb-8">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 mb-2 border border-rose-100">
          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
          <span>Appreciation Notes</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
          Appreciation Wall
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          A dedicated wall of heartfelt appreciation, cheers, and gratitude for the members.
        </p>
      </div>

      <button
        onClick={() => feed.setShowCreateModal(true)}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-6 py-3 text-xs font-bold text-white shadow-md shadow-rose-200 hover:scale-102 transition-all self-start sm:self-auto"
      >
        <Plus className="h-4 w-4" />
        <span>Add a Note</span>
      </button>
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
        setSelectedMember={feed.setSelectedMember as any}
        handleLike={feed.handleLike}
        handleAddComment={feed.handleAddComment}
        setReportTarget={feed.setReportTarget as any}
        setToast={feed.setToast}
        setShowCreateModal={feed.setShowCreateModal}
        showTabs={false} // Only showing Appreciations
        emptyIcon={Heart}
        emptyTitle="No appreciation notes yet"
        emptyDesc="Leave the first kind note for the members!"
        emptyBtnText="Add Note"
        emptyBtnColor="bg-rose-500 hover:bg-rose-600"
      />

      {feed.showCreateModal && (
        <CreatePostModal
          onClose={() => feed.setShowCreateModal(false)}
          defaultCategory="Appreciation"
          defaultMemberId={feed.selectedMember as any}
          onPostCreated={(newPost) => {
            feed.setPosts([newPost, ...feed.posts]);
            feed.setToast({
              type: 'success',
              title: 'Note Published',
              message: 'Your appreciation note has been shared!'
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
              message: 'Thank you for keeping our haven safe.'
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
`);
    }

    console.log('Refactored', fullPath);
  } else {
    console.log('Not found:', fullPath);
  }
});
