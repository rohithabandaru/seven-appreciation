import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Post, Comment, MemberSlug } from '@/types';

export function useFeedPage(initialCategory: string = 'all') {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>(initialCategory);
  const [selectedMember, setSelectedMember] = useState<MemberSlug | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; title: string; message: string } | null>(null);
  const [reportTarget, setReportTarget] = useState<{ id: string; snippet: string } | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      const memberQuery = selectedMember === 'all' ? '' : `&memberId=${selectedMember}`;
      const url = `/api/posts?page=1&limit=10${memberQuery}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const data: Post[] = Array.isArray(json) ? json : json.data ?? [];
        setPosts(data);
        setPage(1);
        setHasMore(data.length >= 10);
      }
    } catch (err) {
      console.error("Failed to load posts", err);
    }
  }, [selectedMember]);

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const memberQuery = selectedMember === 'all' ? '' : `&memberId=${selectedMember}`;
      const url = `/api/posts?page=${nextPage}&limit=10${memberQuery}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const newPosts: Post[] = Array.isArray(json) ? json : json.data ?? [];
        if (newPosts.length > 0) {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const filtered = newPosts.filter((p) => !existingIds.has(p.id));
            return [...prev, ...filtered];
          });
          setPage(nextPage);
          setHasMore(newPosts.length >= 10);
        } else {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Failed to load more posts", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, selectedMember]);

  useEffect(() => {
    setActiveTab(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    let cancelled = false;
    const initialLoad = async () => {
      try {
        const memberQuery = selectedMember === 'all' ? '' : `&memberId=${selectedMember}`;
        const url = `/api/posts?page=1&limit=10${memberQuery}`;
        const res = await fetch(url);
        if (!cancelled && res.ok) {
          const json = await res.json();
          const data: Post[] = Array.isArray(json) ? json : json.data ?? [];
          setPosts(data);
          setPage(1);
          setHasMore(data.length >= 10);
        }
      } catch (err) {
        console.error("Failed to load posts", err);
      }
    };
    initialLoad();

    const handlePostCreated = () => {
      loadPosts();
    };

    window.addEventListener('postCreated', handlePostCreated);
    return () => {
      cancelled = true;
      window.removeEventListener('postCreated', handlePostCreated);
    };
  }, [loadPosts, selectedMember]);

  const handleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post || !userId) return;

    const alreadyLiked = post.likedBy?.includes(userId);
    const action = alreadyLiked ? 'unlike' : 'like';

    const updated = posts.map((p) => {
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
    });
    setPosts(updated);

    try {
      const res = await fetch('/api/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId, action }),
      });
      if (res.ok) {
        const result = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, likesCount: result.likesCount } : p
          )
        );
      } else {
        loadPosts();
      }
    } catch {
      loadPosts();
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
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  commentsCount: (p.commentsCount || 0) + 1,
                  comments: [createdComment, ...(p.comments || [])],
                }
              : p
          )
        );
      }
    } catch {
      await loadPosts();
    }
  };

  const handleDeletePost = async (postId: string) => {
    const prevPosts = [...posts];
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setToast({
          type: 'success',
          title: 'Post Deleted',
          message: 'Your post was successfully removed.',
        });
      } else {
        const err = await res.json().catch(() => ({}));
        setPosts(prevPosts);
        setToast({
          type: 'error',
          title: 'Failed to Delete',
          message: err.error || 'Could not delete the post. Please try again.',
        });
      }
    } catch {
      setPosts(prevPosts);
      setToast({
        type: 'error',
        title: 'Error',
        message: 'Network error occurred while deleting the post.',
      });
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    const prevPosts = [...posts];
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              commentsCount: Math.max(0, (p.commentsCount || 1) - 1),
              comments: (p.comments || []).filter((c) => c.id !== commentId),
            }
          : p
      )
    );

    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setToast({
          type: 'success',
          title: 'Reply Deleted',
          message: 'Your reply has been removed.',
        });
      } else {
        const err = await res.json().catch(() => ({}));
        setPosts(prevPosts);
        setToast({
          type: 'error',
          title: 'Failed to Delete Reply',
          message: err.error || 'Could not delete reply.',
        });
      }
    } catch {
      setPosts(prevPosts);
      setToast({
        type: 'error',
        title: 'Error',
        message: 'Network error occurred while deleting the reply.',
      });
    }
  };

  const handleSetTab = (tab: string) => {
    setActiveTab(tab);
    router.replace(`/?tab=${encodeURIComponent(tab)}`, { scroll: false });
  };

  return {
    posts,
    setPosts,
    activeTab,
    setActiveTab: handleSetTab,
    selectedMember,
    setSelectedMember,
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
  };
}
