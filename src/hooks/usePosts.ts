import { useState, useEffect, useCallback } from 'react';
import { Post, User } from '../types';
import { postService } from '../services/postService';

export const usePosts = (currentUser: User | null) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetched = await postService.getPosts(currentUser?.id);
      setPosts(fetched);
      const saved = await postService.getSavedPosts();
      setSavedPosts(saved);
    } catch (err: unknown) {
      console.error('Failed to load posts:', err);
      setError('Could not retrieve feed posts.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Create Post
  const handleCreatePost = async (content: string, imageUrl?: string) => {
    if (!currentUser) throw new Error('Must be signed in to create a post');

    try {
      const newPost = await postService.createPost(currentUser, content, imageUrl);
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish post';
      setError(msg);
      throw err;
    }
  };

  // Edit Post
  const handleEditPost = async (postId: string, content: string, imageUrl?: string) => {
    try {
      const updated = await postService.editPost(postId, content, imageUrl);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      setSavedPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      return updated;
    } catch (err) {
      console.error('Failed to edit post:', err);
      throw err;
    }
  };

  // Delete Post
  const handleDeletePost = async (postId: string) => {
    try {
      await postService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
      throw err;
    }
  };

  // Toggle Save Post
  const handleToggleSave = async (postId: string) => {
    try {
      const isSaved = await postService.toggleSave(postId);
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, isSaved } : post))
      );
      const saved = await postService.getSavedPosts();
      setSavedPosts(saved);
      return isSaved;
    } catch (err) {
      console.error('Failed to toggle save post:', err);
      throw err;
    }
  };

  // Toggle Like
  const handleToggleLike = async (postId: string) => {
    if (!currentUser) return;

    // Optimistic UI Update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const currentlyLiked = post.isLiked;
          return {
            ...post,
            isLiked: !currentlyLiked,
            likesCount: currentlyLiked ? Math.max(0, post.likesCount - 1) : post.likesCount + 1,
          };
        }
        return post;
      })
    );

    try {
      const result = await postService.toggleLike(postId, currentUser);
      // Sync actual result
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: result.isLiked,
              likesCount: result.likesCount,
            };
          }
          return post;
        })
      );
    } catch (err) {
      console.error('Failed to toggle like:', err);
      fetchPosts();
    }
  };

  // Add Comment
  const handleAddComment = async (postId: string, content: string) => {
    if (!currentUser) return;

    try {
      const newComment = await postService.addComment(postId, currentUser, content);
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            const comments = post.comments || [];
            return {
              ...post,
              comments: [...comments, newComment],
              commentsCount: (post.commentsCount || 0) + 1,
            };
          }
          return post;
        })
      );
      return newComment;
    } catch (err) {
      console.error('Failed to add comment:', err);
      throw err;
    }
  };

  return {
    posts,
    savedPosts,
    isLoading,
    error,
    refreshPosts: fetchPosts,
    createPost: handleCreatePost,
    editPost: handleEditPost,
    deletePost: handleDeletePost,
    toggleSave: handleToggleSave,
    toggleLike: handleToggleLike,
    addComment: handleAddComment,
  };
};
