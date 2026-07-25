import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Post } from '../types';
import { getStoredUsers, saveStoredUsers } from './authService';
import { getStoredPosts, saveStoredPosts } from './postService';

export const userService = {
  // Fetch user profile by ID or username
  async getUserProfile(identifier: string): Promise<User | null> {
    if (isSupabaseConfigured()) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
        let query = supabase.from('profiles').select('*');
        if (isUuid) {
          query = query.eq('id', identifier);
        } else {
          query = query.eq('username', identifier);
        }

        const { data, error } = await query.single();
        if (!error && data) {
          return {
            id: data.id,
            email: `${data.username}@connecthub.dev`,
            username: data.username,
            fullName: data.full_name,
            avatarUrl: data.avatar_url,
            bio: data.bio,
            website: data.website,
            githubUrl: data.github_url,
            role: data.role,
            followersCount: data.followers_count || 0,
            followingCount: data.following_count || 0,
            createdAt: data.created_at,
          };
        }
      } catch (err) {
        console.warn('Supabase fetch user profile failed, using local storage fallback:', err);
      }
    }

    // Mock storage fallback
    const users = getStoredUsers();
    const found = users.find(
      (u) => u.id === identifier || u.username.toLowerCase() === identifier.toLowerCase()
    );
    return found || null;
  },

  // Get suggested developers (random subset from stored users)
  async getSuggestedUsers(limit: number = 5): Promise<User[]> {
    const users = getStoredUsers();
    return users.slice(0, limit);
  },

  // Toggle follow status between current user and target user with 1-to-1 dynamic reciprocity
  async toggleFollowUser(
    currentUserId: string,
    targetUserId: string
  ): Promise<{ currentUser: User; targetUser: User; isFollowing: boolean }> {
    const users = getStoredUsers();
    const currentUserIndex = users.findIndex(
      (u) => u.id === currentUserId || u.username === currentUserId
    );
    const targetUserIndex = users.findIndex(
      (u) => u.id === targetUserId || u.username === targetUserId
    );

    if (currentUserIndex === -1 || targetUserIndex === -1) {
      const fallbackUser = users.find((u) => u.id === currentUserId) || users[0];
      const fallbackTarget = users.find((u) => u.id === targetUserId) || users[1];
      return { currentUser: fallbackUser, targetUser: fallbackTarget, isFollowing: true };
    }

    const currentUser = { ...users[currentUserIndex] };
    const targetUser = { ...users[targetUserIndex] };

    const currentFollowing = currentUser.followingIds || [];
    const targetFollowers = targetUser.followersIds || [];

    const isCurrentlyFollowing = currentFollowing.includes(targetUser.id);

    let updatedCurrentUser: User;
    let updatedTargetUser: User;

    if (isCurrentlyFollowing) {
      // Unfollow action
      const newFollowing = currentFollowing.filter((id) => id !== targetUser.id);
      const newFollowers = targetFollowers.filter((id) => id !== currentUser.id);

      updatedCurrentUser = {
        ...currentUser,
        followingIds: newFollowing,
        followingCount: Math.max(0, newFollowing.length),
      };

      updatedTargetUser = {
        ...targetUser,
        followersIds: newFollowers,
        followersCount: Math.max(0, newFollowers.length),
      };
    } else {
      // Follow action
      const newFollowing = Array.from(new Set([...currentFollowing, targetUser.id]));
      const newFollowers = Array.from(new Set([...targetFollowers, currentUser.id]));

      updatedCurrentUser = {
        ...currentUser,
        followingIds: newFollowing,
        followingCount: newFollowing.length,
      };

      updatedTargetUser = {
        ...targetUser,
        followersIds: newFollowers,
        followersCount: newFollowers.length,
      };
    }

    users[currentUserIndex] = updatedCurrentUser;
    users[targetUserIndex] = updatedTargetUser;
    saveStoredUsers(users);

    // Update current user session if applicable
    const currentSaved = localStorage.getItem('connecthub_current_user');
    if (currentSaved) {
      try {
        const parsed = JSON.parse(currentSaved);
        if (parsed.id === updatedCurrentUser.id || parsed.username === updatedCurrentUser.username) {
          localStorage.setItem('connecthub_current_user', JSON.stringify(updatedCurrentUser));
        }
      } catch (e) {}
    }

    return {
      currentUser: updatedCurrentUser,
      targetUser: updatedTargetUser,
      isFollowing: !isCurrentlyFollowing,
    };
  },

  // Search users by query
  async searchUsers(query: string): Promise<User[]> {
    const users = getStoredUsers();
    if (!query.trim()) return users.slice(0, 20);
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.bio && u.bio.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q))
    );
  },

  // Update user profile details
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: updates.fullName,
            username: updates.username,
            role: updates.role,
            bio: updates.bio,
            website: updates.website,
            github_url: updates.githubUrl,
            avatar_url: updates.avatarUrl,
          })
          .eq('id', userId);

        if (error) {
          console.warn('Supabase profile update warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase update profile failed:', err);
      }
    }

    // Local storage update
    const users = getStoredUsers();
    const userIndex = users.findIndex((u) => u.id === userId || u.username === userId);
    if (userIndex === -1) throw new Error('User not found');

    const updatedUser: User = {
      ...users[userIndex],
      ...updates,
    };

    users[userIndex] = updatedUser;
    saveStoredUsers(users);

    // Update session storage if current user
    localStorage.setItem('connecthub_current_user', JSON.stringify(updatedUser));
    localStorage.setItem('connect2dev_current_user', JSON.stringify(updatedUser));

    // Cascade update across all posts, comments, and likers
    const posts = getStoredPosts();
    let postsModified = false;

    const updatedPosts = posts.map((post) => {
      let postUpdated = false;
      let newPost = { ...post };

      // Update author profile on post
      if (post.userId === userId || post.user?.id === userId) {
        newPost.user = { ...newPost.user, ...updatedUser };
        postUpdated = true;
      }

      // Update author profile on comments
      if (newPost.comments && newPost.comments.length > 0) {
        const newComments = newPost.comments.map((c) => {
          if (c.userId === userId || c.user?.id === userId) {
            postUpdated = true;
            return {
              ...c,
              user: { ...c.user, ...updatedUser },
            };
          }
          return c;
        });
        if (postUpdated) {
          newPost.comments = newComments;
        }
      }

      // Update user in likedByUsers list
      if (newPost.likedByUsers && newPost.likedByUsers.length > 0) {
        const newLikers = newPost.likedByUsers.map((l) => {
          if (l.id === userId) {
            postUpdated = true;
            return { ...l, ...updatedUser };
          }
          return l;
        });
        if (postUpdated) {
          newPost.likedByUsers = newLikers;
        }
      }

      if (postUpdated) postsModified = true;
      return newPost;
    });

    if (postsModified) {
      saveStoredPosts(updatedPosts);
    }

    return updatedUser;
  },

  // Fetch posts by a specific user
  async getUserPosts(userId: string): Promise<Post[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (id, username, full_name, avatar_url),
            comments (*, profiles:user_id (id, username, full_name, avatar_url)),
            likes (user_id)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((p: any) => ({
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
        console.warn('Supabase fetch user posts failed:', err);
      }
    }

    // Mock storage fallback
    const allPosts = getStoredPosts();
    return allPosts.filter((p) => p.userId === userId || p.user?.id === userId);
  }
};
