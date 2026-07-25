import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { getStoredUsers } from '../../services/authService';
import { userService } from '../../services/userService';
import { Avatar } from '../common/Avatar';
import { Search, X, Check, Code2, ExternalLink } from 'lucide-react';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSelectUser?: (user: User) => void;
}

export const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [query, setQuery] = useState('');
  const [followedIds, setFollowedIds] = useState<string[]>(currentUser?.followingIds || []);

  useEffect(() => {
    if (currentUser?.followingIds) {
      setFollowedIds(currentUser.followingIds);
    }
  }, [currentUser?.followingIds]);

  if (!isOpen) return null;

  const allUsers = getStoredUsers();

  const filteredUsers = allUsers
    .filter((u) => u.id !== currentUser?.id && u.username !== currentUser?.username)
    .filter(
      (u) =>
        u.fullName.toLowerCase().includes(query.toLowerCase()) ||
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        (u.bio && u.bio.toLowerCase().includes(query.toLowerCase())) ||
        (u.role && u.role.toLowerCase().includes(query.toLowerCase()))
    );

  const toggleFollow = async (e: React.MouseEvent, targetUserId: string) => {
    e.stopPropagation();
    if (!currentUser) return;
    try {
      const res = await userService.toggleFollowUser(currentUser.id, targetUserId);
      setFollowedIds(res.currentUser.followingIds || []);
    } catch (err) {
      console.error('Search follow toggle error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-zinc-900 dark:text-zinc-100 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500" />
            Search Connect2Dev Developers ({allUsers.length})
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, handle, tech role, or bio..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 pt-2">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              No developers found matching "{query}".
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isFollowing = followedIds.includes(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => {
                    if (onSelectUser) onSelectUser(user);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={user.avatarUrl} name={user.fullName} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                        {user.fullName}
                        <ExternalLink className="w-3 h-3 text-zinc-400 opacity-60" />
                      </p>
                      <p className="text-xs text-blue-500 truncate">@{user.username}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                        {user.role || user.bio}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleFollow(e, user.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shrink-0 ml-2 ${
                      isFollowing
                        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20'
                    }`}
                  >
                    {isFollowing ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Following
                      </span>
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
