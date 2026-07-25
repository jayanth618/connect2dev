import React, { useState, useEffect } from 'react';
import { NotificationItem, User } from '../../types';
import { notificationService } from '../../services/notificationService';
import { Avatar } from '../common/Avatar';
import { Heart, MessageSquare, UserPlus, AtSign, Check, Bell, Sparkles } from 'lucide-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUserProfile?: (user: User) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onSelectUserProfile,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active'>('all');

  useEffect(() => {
    if (isOpen) {
      setNotifications(notificationService.getNotifications());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeNotifs = notifications.filter((n) => !n.isRead);
  const existingNotifs = notifications.filter((n) => n.isRead);

  const handleMarkAllRead = () => {
    const updated = notificationService.markAllAsRead();
    setNotifications(updated);
  };

  const handleMarkSingleRead = (id: string) => {
    const updated = notificationService.markAsRead(id);
    setNotifications(updated);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />;
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-400" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-emerald-400" />;
      case 'mention':
        return <AtSign className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const displayedList = activeTab === 'active' ? activeNotifs : notifications;

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-zinc-900 dark:text-zinc-100 animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-500" />
          <h3 className="font-bold text-sm">Notifications</h3>
          {activeNotifs.length > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {activeNotifs.length} new
            </span>
          )}
        </div>

        {activeNotifs.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-semibold flex items-center gap-1 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold bg-zinc-50/50 dark:bg-zinc-900/30">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
            activeTab === 'all'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-950'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
            activeTab === 'active'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-950'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          Active / Unread ({activeNotifs.length})
        </button>
      </div>

      {/* Notifications Body */}
      <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {displayedList.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            {activeTab === 'active' ? 'No new active notifications!' : 'No notifications yet.'}
          </div>
        ) : (
          displayedList.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                handleMarkSingleRead(notif.id);
                if (onSelectUserProfile) onSelectUserProfile(notif.actor);
                onClose();
              }}
              className={`p-3.5 flex gap-3 items-start cursor-pointer transition-colors ${
                !notif.isRead
                  ? 'bg-blue-50/80 dark:bg-blue-950/30 border-l-4 border-l-blue-500'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
              }`}
            >
              <div className="relative shrink-0">
                <Avatar src={notif.actor.avatarUrl} name={notif.actor.fullName} size="sm" />
                <span className="absolute -bottom-1 -right-1 p-0.5 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800">
                  {getIcon(notif.type)}
                </span>
              </div>

              <div className="flex-1 min-w-0 text-xs">
                <p className="text-zinc-800 dark:text-zinc-200 leading-snug">
                  <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {notif.actor.fullName}
                  </strong>{' '}
                  {notif.type === 'like' && 'liked your post'}
                  {notif.type === 'comment' && 'commented on your post'}
                  {notif.type === 'follow' && 'started following you'}
                  {notif.type === 'mention' && 'mentioned you in a discussion'}
                </p>

                {notif.postSummary && (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-1 italic">
                    "{notif.postSummary}"
                  </p>
                )}

                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-zinc-400">{formatRelativeTime(notif.createdAt)}</span>
                  {!notif.isRead && (
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
