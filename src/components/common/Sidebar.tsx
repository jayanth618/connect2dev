import React, { useState, useEffect } from 'react';
import { Community } from '../../types';
import { communityService } from '../../services/communityService';
import { Home, Hash, Users, Bookmark, Terminal, MessageSquare, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  onTabSelect?: (tab: string) => void;
  onSearchOpen?: () => void;
  onSelectCommunity?: (community: Community) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'home',
  onTabSelect,
  onSearchOpen,
  onSelectCommunity,
}) => {
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    setCommunities(communityService.getCommunities());
  }, []);

  const navItems = [
    { id: 'home', label: 'Home Feed', icon: Home },
    { id: 'explore', label: 'Explore Tags & Devs', icon: Hash },
    { id: 'network', label: 'Developer Network', icon: Users },
    { id: 'saved', label: 'Saved Snippets', icon: Bookmark },
  ];

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 flex flex-col p-4 gap-6 shrink-0 hidden md:flex text-zinc-900 dark:text-zinc-100 bg-white/50 dark:bg-zinc-950/50 transition-colors sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Navigation links */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (onTabSelect) {
                  onTabSelect(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all text-left ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Communities */}
      <div className="px-2 pt-2 border-t border-zinc-200 dark:border-zinc-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-2 flex items-center gap-1.5">
            <MessageSquare className="w-3 h-3 text-blue-500" />
            Active Communities
          </h3>
        </div>

        <div className="space-y-1.5">
          {communities.map((comm) => (
            <div
              key={comm.id}
              onClick={() => onSelectCommunity && onSelectCommunity(comm)}
              className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 group"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className={`w-2 h-2 rounded-full ${comm.color} shrink-0`} />
                <span className="truncate font-medium">{comm.name}</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono group-hover:text-blue-500">
                {comm.subscribersCount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Network Status Widget */}
      <div className="mt-auto bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-2xl text-xs space-y-2">
        <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-300 font-bold">
          <Terminal className="w-4 h-4 text-emerald-500" />
          <span>Connect2Dev Engine</span>
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
          160+ Developer Profiles synced with dynamic follower networks and technical feed snippets.
        </p>
      </div>
    </aside>
  );
};
