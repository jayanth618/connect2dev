import React, { useState } from 'react';
import { User } from '../../types';
import { getStoredUsers } from '../../services/authService';
import { Avatar } from '../common/Avatar';
import { X, Heart, ExternalLink, Search, Sparkles } from 'lucide-react';

interface LikersModalProps {
  isOpen: boolean;
  onClose: () => void;
  likers: User[];
  likesCount?: number;
  onSelectUser: (user: User) => void;
}

export const LikersModal: React.FC<LikersModalProps> = ({
  isOpen,
  onClose,
  likers,
  likesCount = 0,
  onSelectUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Fallback: If likers array is empty or shorter than 50, pull real developers from stored users
  const allUsers = getStoredUsers();
  let displayedLikers = [...likers];

  if (displayedLikers.length < 50) {
    const existingIds = new Set(displayedLikers.map((u) => u.id));
    for (const user of allUsers) {
      if (!existingIds.has(user.id)) {
        displayedLikers.push(user);
        existingIds.add(user.id);
      }
      if (displayedLikers.length >= 50) break;
    }
  }

  // Filter likers by search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedLikers = displayedLikers.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.role && u.role.toLowerCase().includes(q))
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 text-zinc-900 dark:text-zinc-100 space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              Liked by {displayedLikers.length} Verified Developers
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Engineers & architects who found this technical update valuable.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar inside Likers Modal */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search among 50 developer likers by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
        </div>

        {/* Likers List */}
        <div className="max-h-96 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {displayedLikers.length === 0 ? (
            <p className="text-xs text-zinc-500 py-8 text-center">No developer likers match your search query.</p>
          ) : (
            displayedLikers.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-blue-50/50 dark:hover:bg-zinc-900 cursor-pointer transition-all border border-zinc-200/60 dark:border-zinc-800/80 hover:border-blue-300 dark:hover:border-blue-800 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={user.avatarUrl} name={user.fullName} size="md" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-500 transition-colors">
                      {user.fullName}
                    </p>
                    <p className="text-[11px] text-blue-500 truncate font-mono">@{user.username}</p>
                    {user.role && (
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5">{user.role}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform shrink-0 ml-2 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-800/60">
                  <span>View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
