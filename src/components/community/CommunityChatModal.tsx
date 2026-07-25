import React, { useState, useEffect, useRef } from 'react';
import { Community, CommunityMessage, User } from '../../types';
import { communityService } from '../../services/communityService';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { X, Send, Image as ImageIcon, Link as LinkIcon, Users, Hash, MessageSquare, Sparkles } from 'lucide-react';

interface CommunityChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: Community | null;
  allCommunities: Community[];
  onSelectCommunity: (c: Community) => void;
  currentUser: User | null;
  onRequireAuth?: () => void;
}

export const CommunityChatModal: React.FC<CommunityChatModalProps> = ({
  isOpen,
  onClose,
  community,
  allCommunities,
  onSelectCommunity,
  currentUser,
  onRequireAuth,
}) => {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && community) {
      const msgs = communityService.getCommunityMessages(community.id);
      setMessages(msgs);
    }
  }, [isOpen, community]);

  useEffect(() => {
    if (messages.length > 0) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!isOpen || !community) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) return;

    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    setIsSubmitting(true);
    try {
      const newMsg = communityService.addMessage(
        community.id,
        currentUser,
        content.trim(),
        imageUrl || undefined
      );
      setMessages((prev) => [...prev, newMsg]);
      setContent('');
      setImageUrl('');
      setShowImageUrlInput(false);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl h-[85vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className={`w-3.5 h-3.5 rounded-full ${community.color} shrink-0`} />
            <div>
              <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                {community.name}
                <span className="text-xs font-normal text-zinc-500 font-mono">
                  ({community.subscribersCount} members)
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                {community.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Communities Quick Switch Bar */}
        <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">
            Channels:
          </span>
          {allCommunities.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCommunity(c)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                c.id === community.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${c.color}`} />
              {c.slug}
            </button>
          ))}
        </div>

        {/* Topics Bar */}
        <div className="px-4 py-2 bg-zinc-50/50 dark:bg-zinc-900/20 border-b border-zinc-200 dark:border-zinc-800/60 flex items-center gap-2 overflow-x-auto shrink-0 text-xs">
          <span className="text-[10px] text-zinc-400 font-semibold uppercase">Topics:</span>
          {community.topics.map((t) => (
            <span
              key={t}
              className="bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded text-[11px]"
            >
              #{t}
            </span>
          ))}
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/30 dark:bg-zinc-950/40">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs space-y-1">
              <MessageSquare className="w-8 h-8 text-zinc-400 mx-auto opacity-50" />
              <p className="font-semibold text-zinc-600 dark:text-zinc-400">
                Welcome to {community.name}!
              </p>
              <p>Be the first to share code ideas, questions, or updates in this hub.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="flex gap-3 bg-white dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm"
              >
                <Avatar src={msg.user.avatarUrl} name={msg.user.fullName} size="md" />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      {msg.user.fullName}
                      <span className="text-[11px] text-blue-500 font-normal">@{msg.user.username}</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {formatRelativeTime(msg.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>

                  {msg.imageUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-64 bg-zinc-900">
                      <img
                        src={msg.imageUrl}
                        alt="Community attachment"
                        className="w-full h-full object-cover max-h-64"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Compose Form */}
        <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 space-y-2">
          {imageUrl && (
            <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-32 w-fit bg-zinc-900">
              <img src={imageUrl} alt="Upload preview" className="max-h-32 object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white p-1 rounded-full text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {showImageUrlInput && (
            <div className="flex gap-2 items-center">
              <input
                type="url"
                placeholder="Paste image link URL (https://...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-1.5 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowImageUrlInput(false)}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-2"
              >
                Cancel
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex gap-2 items-center">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => {
                if (!currentUser && onRequireAuth) {
                  onRequireAuth();
                  return;
                }
                fileInputRef.current?.click();
              }}
              className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl text-zinc-500 hover:text-blue-500 transition-colors"
              title="Upload Photo"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (!currentUser && onRequireAuth) {
                  onRequireAuth();
                  return;
                }
                setShowImageUrlInput(!showImageUrlInput);
              }}
              className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl text-zinc-500 hover:text-blue-500 transition-colors"
              title="Link Image URL"
            >
              <LinkIcon className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder={
                currentUser
                  ? `Share ideas or code in ${community.slug}...`
                  : 'Sign in to join community discussions...'
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onClick={() => {
                if (!currentUser && onRequireAuth) onRequireAuth();
              }}
              className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 px-4 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />

            <Button
              type="submit"
              size="sm"
              disabled={(!content.trim() && !imageUrl) || isSubmitting || !currentUser}
              className="gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
