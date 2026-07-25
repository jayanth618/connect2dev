import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { userService } from '../../services/userService';
import { Avatar } from './Avatar';
import { TrendingUp, UserPlus, Check, Sparkles } from 'lucide-react';

interface RightSidebarProps {
  currentUser: User | null;
  onOpenSearch?: () => void;
  onSelectUser?: (user: User) => void;
  onSelectTopicTag?: (tag: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  currentUser,
  onOpenSearch,
  onSelectUser,
  onSelectTopicTag,
}) => {
  const [followedIds, setFollowedIds] = useState<string[]>(currentUser?.followingIds || []);
  const [suggestedPeers, setSuggestedPeers] = useState<User[]>([]);

  useEffect(() => {
    if (currentUser?.followingIds) {
      setFollowedIds(currentUser.followingIds);
    }
  }, [currentUser?.followingIds]);

  useEffect(() => {
    userService.getSuggestedUsers(15).then((users) => {
      // Exclude currentUser from suggested peers
      const filtered = users.filter(
        (u) => u.id !== currentUser?.id && u.username !== currentUser?.username
      );
      setSuggestedPeers(filtered.slice(0, 4));
    });
  }, [currentUser?.id, currentUser?.username]);

  const trendingTopics = [
    { tag: '#NextJS15', category: 'Frameworks', posts: '14.2k discussions' },
    { tag: '#SOLID_Principles', category: 'Software Architecture', posts: '8.5k posts' },
    { tag: '#SupabaseEdge', category: 'Cloud Architecture', posts: '3.1k posts' },
    { tag: '#TypeScript_5_8', category: 'Type Safety', posts: '19.4k posts' },
  ];

  const toggleFollow = async (e: React.MouseEvent, peer: User) => {
    e.stopPropagation();
    if (!currentUser) return;
    try {
      const res = await userService.toggleFollowUser(currentUser.id, peer.id);
      setFollowedIds(res.currentUser.followingIds || []);
    } catch (err) {
      console.error('Sidebar follow error:', err);
    }
  };

  return (
    <aside className="w-80 border-l border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-6 shrink-0 hidden lg:flex text-zinc-900 dark:text-zinc-100 bg-white/50 dark:bg-zinc-950/50 transition-colors sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Suggested Peers */}
      <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-blue-500" />
            Suggested Developers
          </h3>
          <button
            onClick={onOpenSearch}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
          >
            See All (60+)
          </button>
        </div>

        <div className="space-y-3.5">
          {suggestedPeers.map((peer) => {
            const isFollowing = followedIds.includes(peer.id);
            return (
              <div
                key={peer.id}
                onClick={() => onSelectUser && onSelectUser(peer)}
                className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors"
              >
                <div className="flex gap-2.5 items-center min-w-0">
                  <Avatar src={peer.avatarUrl} name={peer.fullName} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {peer.fullName}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {peer.role || `@${peer.username}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => toggleFollow(e, peer)}
                  className={`text-xs font-bold px-3 py-1 rounded-lg transition-all shrink-0 ${
                    isFollowing
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
                      : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100'
                  }`}
                >
                  {isFollowing ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500" /> Following
                    </span>
                  ) : (
                    'Follow'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          Trending Stack Topics
        </h3>

        <div className="space-y-3.5">
          {trendingTopics.map((item) => (
            <div
              key={item.tag}
              className="group cursor-pointer p-1.5 rounded-xl hover:bg-blue-50/50 dark:hover:bg-zinc-800/50 transition-colors"
              onClick={() => (onSelectTopicTag ? onSelectTopicTag(item.tag) : onOpenSearch && onOpenSearch())}
            >
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{item.category}</p>
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-500 transition-colors mt-0.5">
                {item.tag}
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">{item.posts}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
