import React, { useState } from 'react';
import { Comment, User } from '../../types';
import { Avatar } from '../common/Avatar';
import { Send } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  currentUser: User | null;
  onAddComment: (postId: string, content: string) => Promise<any>;
  onSelectUser?: (user: User) => void;
  onRequireAuth?: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments,
  currentUser,
  onAddComment,
  onSelectUser,
  onRequireAuth,
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddComment(postId, content.trim());
      setContent('');
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 space-y-4">
      {/* Comments List */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-1">
            No comments yet. Be the first developer to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 text-xs bg-zinc-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/60"
            >
              <div
                className="cursor-pointer shrink-0"
                onClick={() => onSelectUser && comment.user && onSelectUser(comment.user as User)}
              >
                <Avatar src={comment.user.avatarUrl} name={comment.user.fullName} size="xs" />
              </div>
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    onClick={() => onSelectUser && comment.user && onSelectUser(comment.user as User)}
                    className="font-semibold text-zinc-900 dark:text-zinc-200 hover:text-blue-500 cursor-pointer transition-colors"
                  >
                    {comment.user.fullName}{' '}
                    <span className="text-zinc-500 font-normal ml-1">@{comment.user.username}</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">{formatRelativeTime(comment.createdAt)}</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center pt-2">
        <Avatar src={currentUser?.avatarUrl} name={currentUser?.fullName || 'User'} size="xs" />
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={
              currentUser ? 'Write a reply or code suggestion...' : 'Sign in to leave a comment...'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!currentUser}
            className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-3 pr-10 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting || !currentUser}
            className="absolute right-2 top-1.5 p-1 text-zinc-400 hover:text-blue-500 disabled:opacity-40 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
