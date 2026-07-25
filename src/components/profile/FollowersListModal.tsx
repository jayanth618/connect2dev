import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { userService } from '../../services/userService';
import { Avatar } from '../common/Avatar';
import { X, Users, UserCheck, ExternalLink } from 'lucide-react';

interface FollowersListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  userIds: string[];
  onSelectUser: (user: User) => void;
}

export const FollowersListModal: React.FC<FollowersListModalProps> = ({
  isOpen,
  onClose,
  title,
  userIds,
  onSelectUser,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userIds.length > 0) {
      setIsLoading(true);
      Promise.all(userIds.map((id) => userService.getUserProfile(id)))
        .then((results) => {
          setUsers(results.filter((u): u is User => u !== null));
        })
        .finally(() => setIsLoading(false));
    } else {
      setUsers([]);
      setIsLoading(false);
    }
  }, [isOpen, userIds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-5 text-zinc-900 dark:text-zinc-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            {title} ({userIds.length})
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
          {isLoading ? (
            <p className="text-xs text-zinc-500 py-6 text-center animate-pulse">
              Loading developers...
            </p>
          ) : users.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">
              No developers found in this list.
            </p>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                onClick={() => {
                  onSelectUser(u);
                  onClose();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={u.avatarUrl} name={u.fullName} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {u.fullName}
                    </p>
                    <p className="text-[10px] text-blue-500 truncate">@{u.username}</p>
                    {u.bio && (
                      <p className="text-[10px] text-zinc-500 truncate">{u.bio}</p>
                    )}
                  </div>
                </div>

                <ExternalLink className="w-4 h-4 text-zinc-400 hover:text-blue-500 transition-colors shrink-0 ml-2" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
