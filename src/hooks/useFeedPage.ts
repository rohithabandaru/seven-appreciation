import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWRInfinite from 'swr/infinite';
import { Post, Comment, MemberSlug } from '@/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
};

export function useFeedPage(initialCategory: string = 'all') {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>(initialCategory);
  const [selectedMember, setSelectedMember] = useState<MemberSlug | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; title: string; message: string } | null>(null);
  const [reportTarget, setReportTarget] = useState<{ id: string; snippet: string } | null>(null);

  const getKey = (pageIndex: number, previousPageData: any) => {
    // Reached the end
    if (previousPageData && (!previousPageData.data || previousPageData.data.length === 0)) return null;
    
    const params = new URLSearchParams();
    params.set('page', (pageIndex + 1).toString());
    params.set('limit', '10');
    if (activeTab !== 'all') params.set('type', activeTab);
    if (selectedMember !== 'all') params.set('memberId', selectedMember);
    return `/api/posts?${params.toString()}`;
  };

  const { data, error, size, setSize, mutate, isValidating } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false,
  });

  const posts: Post[] = data ? [].concat(...data.map(page => page.data || [])) : [];
  
  const isLoading = !data && !error;
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const hasMore = data ? (data[data.length - 1]?.data?.length >= 10) : true;

  const setPosts = useCallback((updater: React.SetStateAction<Post[]>) => {
    mutate((currentPages: any) => {
      if (!currentPages) return currentPages;
      const currentPosts = [].concat(...currentPages.map((p: any) => p.data || []));
      const newPosts = typeof updater === 'function' ? updater(currentPosts) : updater;
      
      const newPages = [];
      const chunkSize = 10;
      for (let i = 0; i < newPosts.length; i += chunkSize) {
        newPages.push({ data: newPosts.slice(i, i + chunkSize) });
      }
      return newPages.length > 0 ? newPages : [{ data: [] }];
    }, { revalidate: false });
  }, [mutate]);

  const loadPosts = useCallback(() => {
    mutate();
  }, [mutate]);

  const loadMorePosts = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setSize(size + 1);
    }
  }, [isLoadingMore, hasMore, size, setSize]);

  useEffect(() => {
    const handlePostCreatedEvent = () => {
      // Revalidate page 1 to get the new post
      mutate();
    };

    window.addEventListener('postCreated', handlePostCreatedEvent);
    return () => {
      window.removeEventListener('postCreated', handlePostCreatedEvent);
    };
  }, [mutate]);

  const handleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post || !userId) return;

    const alreadyLiked = post.likedBy?.includes(userId);
    const action = alreadyLiked ? 'unlike' : 'like';

    setPosts((prev) => prev.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          likesCount: alreadyLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1,
          likedBy: alreadyLiked
            ? (p.likedBy || []).filter((id) => id !== userId)
            : [...(p.likedBy || []), userId],
        };
      }
      return p;
    }));

    try {
      const res = await fetch('/api/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId, action }),
      });
      if (res.ok) {
        const result = await res.json();
        setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likesCount: result.likesCount } : p));
      } else {
        mutate();
      }
    } catch {
      mutate();
    }
  };

  const handleAddComment = async (postId: string, comment: Comment) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment.content }),
      });
      if (res.ok) {
        const createdComment = await res.json();
        setPosts((prev) => prev.map((p) => p.id === postId ? {
          ...p,
          commentsCount: (p.commentsCount || 0) + 1,
          comments: [createdComment, ...(p.comments || [])],
        } : p));
      }
    } catch {
      mutate();
    }
  };

  const handleDeletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        setToast({ type: 'success', title: 'Post Deleted', message: 'Your post was successfully removed.' });
      } else {
        const err = await res.json().catch(() => ({}));
        mutate();
        setToast({ type: 'error', title: 'Failed to Delete', message: err.error || 'Could not delete the post.' });
      }
    } catch {
      mutate();
      setToast({ type: 'error', title: 'Error', message: 'Network error occurred while deleting the post.' });
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    setPosts((prev) => prev.map((p) => p.id === postId ? {
      ...p,
      commentsCount: Math.max(0, (p.commentsCount || 1) - 1),
      comments: (p.comments || []).filter((c) => c.id !== commentId),
    } : p));

    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        setToast({ type: 'success', title: 'Reply Deleted', message: 'Your reply has been removed.' });
      } else {
        const err = await res.json().catch(() => ({}));
        mutate();
        setToast({ type: 'error', title: 'Failed to Delete Reply', message: err.error || 'Could not delete reply.' });
      }
    } catch {
      mutate();
      setToast({ type: 'error', title: 'Error', message: 'Network error occurred while deleting the reply.' });
    }
  };

  const handleSetTab = (tab: string) => {
    setActiveTab(tab);
    setSize(1);
    router.replace(`/?tab=${encodeURIComponent(tab)}`, { scroll: false });
  };

  const handleSetMember = (member: MemberSlug | 'all') => {
    setSelectedMember(member);
    setSize(1);
  };

  return {
    posts,
    setPosts,
    activeTab,
    setActiveTab: handleSetTab,
    selectedMember,
    setSelectedMember: handleSetMember,
    showCreateModal,
    setShowCreateModal,
    toast,
    setToast,
    reportTarget,
    setReportTarget,
    handleLike,
    handleAddComment,
    handleDeletePost,
    handleDeleteComment,
    loadPosts,
    loadMorePosts,
    hasMore,
    isLoadingMore,
    isLoading,
  };
}
