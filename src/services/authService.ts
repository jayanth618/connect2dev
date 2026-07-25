import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';
import { INITIAL_USERS } from '../data/mockData';

const LOCAL_STORAGE_USERS_KEY = 'connecthub_users';
const LOCAL_STORAGE_CURRENT_USER_KEY = 'connecthub_current_user';

// Helper to manage mock users in localStorage
export const getStoredUsers = (): User[] => {
  const defaultFirst10 = ['usr_2', 'usr_3', 'usr_4', 'usr_5', 'usr_6', 'usr_7', 'usr_8', 'usr_9', 'usr_10', 'usr_11'];

  const data = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    const parsed: User[] = JSON.parse(data);
    
    // Sync usr_1 initial defaults if missing
    const usr1Index = parsed.findIndex((u) => u.id === 'usr_1' || u.username === 'jayanth_dev');
    if (usr1Index !== -1) {
      if (!parsed[usr1Index].fullName || parsed[usr1Index].fullName === 'Sarah Jenkins') {
        parsed[usr1Index].fullName = 'Jayanth';
      }
      if (!parsed[usr1Index].username || parsed[usr1Index].username === 'sarah_jenkins') {
        parsed[usr1Index].username = 'jayanth_dev';
      }
      if (!parsed[usr1Index].email) {
        parsed[usr1Index].email = 'jayanth@connect2dev.dev';
      }
      if (!parsed[usr1Index].role) {
        parsed[usr1Index].role = 'Lead Architect';
      }

      // Fix any old mock bug where followersCount was 142 or 1420 or missing IDs
      if (
        !parsed[usr1Index].followersIds ||
        parsed[usr1Index].followersIds.length === 0 ||
        parsed[usr1Index].followersCount > 50
      ) {
        parsed[usr1Index].followersIds = [...defaultFirst10];
        parsed[usr1Index].followingIds = [...defaultFirst10];
      }

      parsed[usr1Index].followersCount = parsed[usr1Index].followersIds.length;
      parsed[usr1Index].followingCount = parsed[usr1Index].followingIds.length;
    }

    // Merge new initial users if missing
    if (parsed.length < INITIAL_USERS.length) {
      const existingIds = new Set(parsed.map((u) => u.id));
      for (const u of INITIAL_USERS) {
        if (!existingIds.has(u.id)) {
          parsed.push(u);
        }
      }
    }

    // Synchronize count for ALL users so followersCount === followersIds.length
    parsed.forEach((u) => {
      if (!u.followersIds) u.followersIds = [];
      if (!u.followingIds) u.followingIds = [];
      u.followersCount = u.followersIds.length;
      u.followingCount = u.followingIds.length;
    });

    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(parsed));
    return parsed;
  } catch (err) {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
};

export const saveStoredUsers = (users: User[]) => {
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
};

export const authService = {
  // Sign Up
  async signUp(email: string, password: string, username: string, fullName: string): Promise<User> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
          },
        },
      });

      if (error) throw new Error(error.message);

      if (data.user) {
        // Fetch or create profile
        const newUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          username,
          fullName,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          bio: 'Full Stack Developer',
          followersCount: 0,
          followingCount: 0,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));
        return newUser;
      }
    }

    // Fallback Mock Mode
    const users = getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase());
    if (existing) {
      throw new Error('User with this email or username already exists.');
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      username: username.toLowerCase().replace(/\s+/g, '_'),
      fullName,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Full Stack Developer on ConnectHub',
      followersCount: 0,
      followingCount: 0,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveStoredUsers(users);
    localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  // Sign In
  async signIn(email: string, password: string): Promise<User> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);

      if (data.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const user: User = profile
          ? {
              id: profile.id,
              email: data.user.email || email,
              username: profile.username,
              fullName: profile.full_name,
              avatarUrl: profile.avatar_url,
              bio: profile.bio,
              website: profile.website,
              githubUrl: profile.github_url,
              followersCount: profile.followers_count || 0,
              followingCount: profile.following_count || 0,
              createdAt: profile.created_at,
            }
          : {
              id: data.user.id,
              email: data.user.email || email,
              username: email.split('@')[0],
              fullName: 'Developer User',
              followersCount: 0,
              followingCount: 0,
              createdAt: new Date().toISOString(),
            };

        localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
        return user;
      }
    }

    // Fallback Mock Mode
    const users = getStoredUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      // Allow instant demo sign in if email matches username
      const foundByUsername = users.find((u) => u.username.toLowerCase() === email.toLowerCase());
      if (foundByUsername) {
        localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(foundByUsername));
        return foundByUsername;
      }
      throw new Error('Invalid email or password.');
    }

    localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(found));
    return found;
  },

  // Quick Demo Developer Login
  async demoLogin(userId: string = 'usr_1'): Promise<User> {
    const users = getStoredUsers();
    const demoUser = users.find((u) => u.id === userId) || users[0];
    localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(demoUser));
    return demoUser;
  },

  // Sign Out
  async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
  },

  // Get Current Logged In User Session
  async getCurrentUser(): Promise<User | null> {
    if (isSupabaseConfigured()) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        const authUser = sessionData.session.user;
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          return {
            id: profile.id,
            email: authUser.email || '',
            username: profile.username,
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url,
            bio: profile.bio,
            website: profile.website,
            githubUrl: profile.github_url,
            followersCount: profile.followers_count || 0,
            followingCount: profile.following_count || 0,
            createdAt: profile.created_at,
          };
        }
      }
    }

    // Fallback Mock Mode check
    const saved = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const users = getStoredUsers();
        const storedUser = users.find((u) => u.id === parsed.id || u.username === parsed.username);
        if (storedUser) {
          localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(storedUser));
          return storedUser;
        }
        return parsed;
      } catch {
        return null;
      }
    }

    // Default to first demo developer for instant out-of-the-box preview experience
    const defaultUser = INITIAL_USERS[0];
    localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  }
};
