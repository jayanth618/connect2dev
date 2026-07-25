import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Post, Comment, User } from '../types';
import { INITIAL_POSTS } from '../data/mockData';

const LOCAL_STORAGE_POSTS_KEY = 'connect2dev_posts';

export const getStoredPosts = (): Post[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY) || localStorage.getItem('connecthub_posts');
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(INITIAL_POSTS));
    return INITIAL_POSTS;
  }
  try {
    let parsed: Post[] = JSON.parse(data);
    let modified = false;

    // If cached posts list is smaller than INITIAL_POSTS, append missing initial posts
    if (parsed.length < INITIAL_POSTS.length) {
      const existingIds = new Set(parsed.map((p) => p.id));
      for (const p of INITIAL_POSTS) {
        if (!existingIds.has(p.id)) {
          parsed.push(p);
        }
      }
      modified = true;
    }

    // Check if posts need syncing for 50 likers or 5 comments or Jayanth author name
    const updated = parsed.map((post, idx) => {
      let postChanged = false;
      const initialMatch = INITIAL_POSTS[idx] || INITIAL_POSTS[0];

      // Sync 50 likers if missing
      if (!post.likedByUsers || post.likedByUsers.length < 50) {
        post.likedByUsers = initialMatch.likedByUsers;
        post.likesCount = Math.max(post.likesCount || 0, 50);
        postChanged = true;
      }

      // Sync 5 comments if missing
      if (!post.comments || post.comments.length < 5) {
        post.comments = initialMatch.comments;
        post.commentsCount = Math.max(post.commentsCount || 0, 5);
        postChanged = true;
      }

      // Sync usr_1 name to Jayanth
      if (post.user?.id === 'usr_1' && (post.user?.fullName === 'Sarah Jenkins' || post.user?.fullName === 'Jayant')) {
        post.user.fullName = 'Jayanth';
        post.user.username = 'jayanth_dev';
        postChanged = true;
      }

      if (postChanged) modified = true;
      return post;
    });

    if (modified) {
      localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(updated));
      return updated;
    }
    return parsed;
  } catch (err) {
    localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(INITIAL_POSTS));
    return INITIAL_POSTS;
  }
};

export const saveStoredPosts = (posts: Post[]) => {
  localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(posts));
};

export const postService = {
  // Fetch All Feed Posts
  async getPosts(currentUserId?: string): Promise<Post[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data: postsData, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (id, username, full_name, avatar_url),
            comments (*, profiles:user_id (id, username, full_name, avatar_url)),
            likes (user_id)
          `)
          .order('created_at', { ascending: false });

        if (!error && postsData) {
          return postsData.map((p: any) => ({
            id: p.id,
            userId: p.user_id,
            user: {
              id: p.profiles?.id || p.user_id,
              username: p.profiles?.username || 'developer',
              fullName: p.profiles?.full_name || 'Developer',
              avatarUrl: p.profiles?.avatar_url,
              followersCount: 10,
              followingCount: 5,
              createdAt: p.created_at,
              email: `${p.profiles?.username || 'user'}@connecthub.dev`,
            },
            content: p.content,
            imageUrl: p.image_url,
            likesCount: p.likes_count || 0,
            commentsCount: p.comments_count || (p.comments ? p.comments.length : 0),
            isLiked: currentUserId ? p.likes?.some((l: any) => l.user_id === currentUserId) : false,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            comments: (p.comments || []).map((c: any) => ({
              id: c.id,
              postId: c.post_id,
              userId: c.user_id,
              user: {
                id: c.profiles?.id || c.user_id,
                username: c.profiles?.username || 'developer',
                fullName: c.profiles?.full_name || 'Developer',
                avatarUrl: c.profiles?.avatar_url,
                followersCount: 10,
                followingCount: 5,
                createdAt: c.created_at,
                email: `${c.profiles?.username || 'user'}@connecthub.dev`,
              },
              content: c.content,
              createdAt: c.created_at,
            })),
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch posts failed, falling back to local storage:', err);
      }
    }

    // Mock storage implementation
    const posts = getStoredPosts();
    if (currentUserId) {
      return posts.map((post) => ({
        ...post,
        isLiked: Boolean((post as any).likedBy?.includes(currentUserId) || post.isLiked),
      }));
    }
    return posts;
  },

  // Create a new post
  async createPost(user: User, content: string, imageUrl?: string): Promise<Post> {
    const posts = getStoredPosts();
    const newPost: Post = {
      id: `post_${Date.now()}`,
      userId: user.id,
      user,
      content,
      imageUrl,
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      isSaved: false,
      comments: [],
      createdAt: new Date().toISOString(),
    };

    posts.unshift(newPost);
    saveStoredPosts(posts);
    return newPost;
  },

  // Edit existing post
  async editPost(postId: string, content: string, imageUrl?: string): Promise<Post> {
    const posts = getStoredPosts();
    const index = posts.findIndex((p) => p.id === postId);
    if (index === -1) throw new Error('Post not found');

    const updatedPost: Post = {
      ...posts[index],
      content,
      imageUrl: imageUrl !== undefined ? imageUrl : posts[index].imageUrl,
      updatedAt: new Date().toISOString(),
    };

    posts[index] = updatedPost;
    saveStoredPosts(posts);
    return updatedPost;
  },

  // Delete post
  async deletePost(postId: string): Promise<void> {
    const posts = getStoredPosts();
    const filtered = posts.filter((p) => p.id !== postId);
    saveStoredPosts(filtered);
  },

  // Toggle Save / Bookmark status
  async toggleSave(postId: string): Promise<boolean> {
    const posts = getStoredPosts();
    const index = posts.findIndex((p) => p.id === postId);
    if (index === -1) throw new Error('Post not found');

    const currentlySaved = Boolean(posts[index].isSaved);
    posts[index] = {
      ...posts[index],
      isSaved: !currentlySaved,
    };

    saveStoredPosts(posts);
    return !currentlySaved;
  },

  // Get Saved / Bookmarked Posts
  async getSavedPosts(): Promise<Post[]> {
    const posts = getStoredPosts();
    return posts.filter((p) => p.isSaved === true);
  },

  // Toggle Like status
  async toggleLike(postId: string, user: User): Promise<{ isLiked: boolean; likesCount: number }> {
    const posts = getStoredPosts();
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) throw new Error('Post not found');

    const targetPost = posts[postIndex];
    const likedBy: string[] = (targetPost as any).likedBy || (targetPost.isLiked ? [user.id] : []);
    const hasLiked = likedBy.includes(user.id);

    let updatedLikedBy: string[];
    let newLikesCount: number;

    if (hasLiked) {
      updatedLikedBy = likedBy.filter((id) => id !== user.id);
      newLikesCount = Math.max(0, targetPost.likesCount - 1);
    } else {
      updatedLikedBy = [...likedBy, user.id];
      newLikesCount = targetPost.likesCount + 1;
    }

    // Also update likedByUsers array
    const existingLikers = targetPost.likedByUsers || [];
    const updatedLikers = hasLiked
      ? existingLikers.filter((u) => u.id !== user.id)
      : [...existingLikers, user];

    posts[postIndex] = {
      ...targetPost,
      likesCount: newLikesCount,
      isLiked: !hasLiked,
      likedBy: updatedLikedBy,
      likedByUsers: updatedLikers,
    } as any;

    saveStoredPosts(posts);
    return { isLiked: !hasLiked, likesCount: newLikesCount };
  },

  // Add Comment
  async addComment(postId: string, user: User, content: string): Promise<Comment> {
    const posts = getStoredPosts();
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) throw new Error('Post not found');

    const newComment: Comment = {
      id: `cmt_${Date.now()}`,
      postId,
      userId: user.id,
      user,
      content,
      createdAt: new Date().toISOString(),
    };

    const targetPost = posts[postIndex];
    const updatedComments = [...(targetPost.comments || []), newComment];
    posts[postIndex] = {
      ...targetPost,
      comments: updatedComments,
      commentsCount: updatedComments.length,
    };

    saveStoredPosts(posts);
    return newComment;
  }
};
