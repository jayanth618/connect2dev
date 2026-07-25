import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { getStoredUsers } from '../../services/authService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import {
  Users,
  UserPlus,
  Check,
  Search,
  Sparkles,
  ExternalLink,
  Briefcase,
  Code2,
  Send,
  Clock,
} from 'lucide-react';

interface DeveloperNetworkViewProps {
  currentUser: User | null;
  onSelectUser: (user: User) => void;
  onRequireAuth: () => void;
}

export const DeveloperNetworkView: React.FC<DeveloperNetworkViewProps> = ({
  currentUser,
  onSelectUser,
  onRequireAuth,
}) => {
  const { updateUserSession } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'not_followed' | 'following'>('not_followed');
  const [searchQuery, setSearchQuery] = useState('');
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const users = getStoredUsers();
    setAllUsers(users);

    if (currentUser) {
      // Find logged in user's current followingIds
      const me = users.find((u) => u.id === currentUser.id || u.username === currentUser.username) || currentUser;
      setFollowingIds(me.followingIds || []);
    }
  }, [currentUser]);

  const toggleFollow = async (e: React.MouseEvent, targetUser: User) => {
    e.stopPropagation();

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    try {
      const result = await userService.toggleFollowUser(currentUser.id, targetUser.id);
      setFollowingIds(result.currentUser.followingIds || []);
      
      if (result.isFollowing) {
        setNotification(`Connected with ${targetUser.fullName}! Followers & Following updated.`);
      } else {
        setNotification(`Disconnected from ${targetUser.fullName}. Followers & Following updated.`);
      }

      setTimeout(() => setNotification(null), 3500);

      // Refresh users list in local state
      const freshUsers = getStoredUsers();
      setAllUsers(freshUsers);

      if (updateUserSession) {
        updateUserSession(result.currentUser);
      }
    } catch (err) {
      console.error('Follow toggle failed:', err);
    }
  };

  // Filter users - EXCLUDE logged in user completely
  let displayedUsers = allUsers.filter(
    (u) => u.id !== currentUser?.id && u.username !== currentUser?.username
  );

  if (filterTab === 'not_followed') {
    displayedUsers = displayedUsers.filter((u) => !followingIds.includes(u.id));
  } else if (filterTab === 'following') {
    displayedUsers = displayedUsers.filter((u) => followingIds.includes(u.id));
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedUsers = displayedUsers.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.bio && u.bio.toLowerCase().includes(q))
    );
  }

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100 w-full pb-12 animate-fade-in relative">
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-zinc-700 dark:border-zinc-200 animate-fade-in">
          <Send className="w-4 h-4 text-blue-400 dark:text-blue-600 shrink-0" />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            LinkedIn-Style Developer Network
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Connect & Network with {allUsers.length > 0 ? allUsers.length : 160}+ Verified Engineers
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
            Discover peer developers, frontend architects, Rust systems leads, and AI researchers. Follow profiles to build your engineering feed.
          </p>
        </div>
      </div>

      {/* Control Bar: Search & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl w-full sm:w-auto text-xs font-semibold">
          <button
            onClick={() => setFilterTab('not_followed')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              filterTab === 'not_followed'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Not Followed Yet ({allUsers.filter((u) => u.id !== currentUser?.id && !followingIds.includes(u.id)).length})</span>
          </button>

          <button
            onClick={() => setFilterTab('following')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              filterTab === 'following'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>My Following ({followingIds.length})</span>
          </button>

          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              filterTab === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Profiles ({allUsers.length - (currentUser ? 1 : 0)})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name, role, or stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Developer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedUsers.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-zinc-500 text-xs space-y-2">
            <Users className="w-8 h-8 mx-auto text-zinc-400 opacity-50" />
            <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">
              No developer profiles found matching criteria.
            </p>
            <p>Try clearing your search query or switching tabs above.</p>
          </div>
        ) : (
          displayedUsers.map((dev) => {
            const isFollowing = followingIds.includes(dev.id);
            return (
              <div
                key={dev.id}
                onClick={() => onSelectUser(dev)}
                className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col group relative"
              >
                {/* Cover Banner */}
                <div className="h-16 bg-gradient-to-r from-zinc-200 via-blue-100 to-indigo-100 dark:from-zinc-800 dark:via-blue-950/40 dark:to-zinc-900 relative">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
                </div>

                {/* Profile Card Body */}
                <div className="p-4 pt-0 flex-1 flex flex-col relative space-y-3">
                  <div className="flex items-end justify-between -mt-8">
                    <div className="p-1 bg-white dark:bg-zinc-900 rounded-full shadow-md">
                      <Avatar src={dev.avatarUrl} name={dev.fullName} size="lg" />
                    </div>

                    <button
                      onClick={(e) => toggleFollow(e, dev)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-sm ${
                        isFollowing
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-500 transition-colors flex items-center gap-1">
                      {dev.fullName}
                    </h3>
                    <p className="text-[11px] text-blue-500 font-mono">@{dev.username}</p>
                    {dev.role && (
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1 mt-1">
                        <Briefcase className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="truncate">{dev.role}</span>
                      </p>
                    )}
                  </div>

                  {dev.bio && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-snug">
                      {dev.bio}
                    </p>
                  )}

                  {/* Followers footer */}
                  <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1 font-medium text-zinc-600 dark:text-zinc-400">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{dev.followersCount}</strong> followers
                    </span>

                    <span className="text-blue-500 group-hover:underline font-semibold flex items-center gap-0.5">
                      View Profile
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
