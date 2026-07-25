import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { User } from '../../types';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { notificationService } from '../../services/notificationService';
import { Search, Code2, Sun, Moon, LogOut, User as UserIcon, Bell, PlusCircle } from 'lucide-react';

interface NavbarProps {
  onSearchClick?: () => void;
  onNewPostClick?: () => void;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
  onProfileClick?: () => void;
  onSelectUserProfile?: (user: User) => void;
  onHomeClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearchClick,
  onNewPostClick,
  onOpenAuthModal,
  onProfileClick,
  onSelectUserProfile,
  onHomeClick,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [activeNotifCount, setActiveNotifCount] = useState(0);

  useEffect(() => {
    const notifs = notificationService.getNotifications();
    const unread = notifs.filter((n) => !n.isRead).length;
    setActiveNotifCount(unread);
  }, [isNotifOpen]);

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-6 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      {/* Brand & Search */}
      <div className="flex items-center gap-4 sm:gap-8">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={onHomeClick}>
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-1">
            Connect<span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 bg-clip-text text-transparent">2Dev</span>
          </span>
        </div>

        {/* Global Search Trigger */}
        <div
          onClick={onSearchClick}
          className="relative w-48 sm:w-80 md:w-96 cursor-pointer group"
        >
          <div className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full py-2 px-10 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors flex items-center justify-between">
            <span className="truncate">Search 60+ developers, posts, tags...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded border border-zinc-300 dark:border-zinc-700">
              ⌘K
            </kbd>
          </div>
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {/* Controls & Account */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-zinc-700" />}
        </button>

        {user ? (
          <>
            <button
              onClick={onNewPostClick}
              className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Post</span>
            </button>

            {/* Notification Icon & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {activeNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                onSelectUserProfile={onSelectUserProfile}
              />
            </div>

            {/* Profile Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 focus:outline-none p-1 rounded-full hover:ring-2 hover:ring-zinc-300 dark:hover:ring-zinc-700 transition-all"
              >
                <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-50 text-zinc-900 dark:text-zinc-200 animate-fade-in"
                  onMouseLeave={() => setIsMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800/80">
                    <p className="text-sm font-semibold truncate">{user.fullName}</p>
                    <p className="text-xs text-zinc-500 truncate">@{user.username}</p>
                  </div>

                  <div className="py-1">
                    <div className="px-4 py-1.5 text-xs text-zinc-500 flex justify-between font-medium">
                      <span>Followers: <strong className="text-zinc-900 dark:text-zinc-200">{user.followersCount}</strong></span>
                      <span>Following: <strong className="text-zinc-900 dark:text-zinc-200">{user.followingCount}</strong></span>
                    </div>
                  </div>

                  <div className="py-1 border-t border-zinc-200 dark:border-zinc-800/80">
                    <button
                      onClick={() => {
                        if (onProfileClick) onProfileClick();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white transition-colors text-left"
                    >
                      <UserIcon className="w-4 h-4 text-blue-500" />
                      View Profile
                    </button>
                  </div>

                  <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenAuthModal?.('login')}
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpenAuthModal?.('register')}
            >
              Get Started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
