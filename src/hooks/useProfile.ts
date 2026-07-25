import { useState, useEffect, useCallback } from 'react';
import { User, Post } from '../types';
import { userService } from '../services/userService';

export const useProfile = (userIdOrUsername: string | null) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = useCallback(async () => {
    if (!userIdOrUsername) return;
    try {
      setIsLoading(true);
      setError(null);
      const user = await userService.getUserProfile(userIdOrUsername);
      setProfile(user);

      if (user) {
        const posts = await userService.getUserPosts(user.id);
        setUserPosts(posts);
      }
    } catch (err: unknown) {
      console.error('Failed to load profile:', err);
      setError('Could not load user profile.');
    } finally {
      setIsLoading(false);
    }
  }, [userIdOrUsername]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const updateProfile = async (updates: Partial<User>) => {
    if (!profile) return;
    try {
      const updated = await userService.updateProfile(profile.id, updates);
      setProfile(updated);
      return updated;
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  };

  return {
    profile,
    userPosts,
    isLoading,
    error,
    refreshProfile: fetchProfileData,
    updateProfile,
  };
};
