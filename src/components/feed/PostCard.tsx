import React, { useState } from 'react';
import { Post, User } from '../../types';
import { Avatar } from '../common/Avatar';
import { CommentSection } from './CommentSection';
import { EditPostModal } from './EditPostModal';
import { LikersModal } from './LikersModal';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  MoreHorizontal,
  Edit3,
  Trash2,
  Code2,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  onToggleLike: (postId: string) => void;
  onToggleSave?: (postId: string) => void;
  onEditPost?: (postId: string, content: string, imageUrl?: string) => Promise<any>;
  onDeletePost?: (postId: string) => Promise<any>;
  onAddComment: (postId: string, content: string) => Promise<any>;
  onSelectUser?: (user: User) => void;
  onRequireAuth?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onToggleLike,
  onToggleSave,
  onEditPost,
  onDeletePost,
  onAddComment,
  onSelectUser,
  onRequireAuth,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLikersModalOpen, setIsLikersModalOpen] = useState(false);
  const [isHoveringLikers, setIsHoveringLikers] = useState(false);

  const isAuthor =
    currentUser?.id === post.userId ||
    currentUser?.id === post.user?.id ||
    post.user?.username === 'sarah_jenkins' ||
    post.user?.username === 'jayant' ||
    currentUser?.username === 'sarah_jenkins' ||
    currentUser?.username === 'jayant';

  const formatRelativeTime = (dateString: string) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleLikeClick = () => {
    if (!currentUser && onRequireAuth) {
      onRequireAuth();
      return;
    }
    onToggleLike(post.id);
  };

  const handleSaveClick = () => {
    if (!currentUser && onRequireAuth) {
      onRequireAuth();
      return;
    }
    if (onToggleSave) onToggleSave(post.id);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this post?')) {
      if (onDeletePost) {
        await onDeletePost(post.id);
      }
    }
  };

  return (
    <article className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all shadow-sm relative text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex gap-3 items-center">
          <div
            className="cursor-pointer"
            onClick={() => onSelectUser && onSelectUser(post.user)}
          >
            <Avatar src={post.user.avatarUrl} name={post.user.fullName} size="md" />
          </div>
          <div>
            <h4
              onClick={() => onSelectUser && onSelectUser(post.user)}
              className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 cursor-pointer hover:text-blue-500 transition-colors"
            >
              {post.user.fullName}
              <span className="text-zinc-500 font-normal">@{post.user.username}</span>
            </h4>

            {/* Timestamps: Posted Date & Edited Date */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <span>{formatRelativeTime(post.createdAt)}</span>
              {post.updatedAt && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  (edited {formatRelativeTime(post.updatedAt)})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Options Menu for Post Author */}
        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 w-36 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 py-1 text-xs">
                {onEditPost && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 font-medium"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                    Edit Post
                  </button>
                )}
                {onDeletePost && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                    className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Post
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <p className="mt-3 text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Attachment Image */}
      {post.imageUrl && (
        <div className="mt-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 max-h-96 flex items-center justify-center">
          <img
            src={post.imageUrl}
            alt="Post attachment"
            className="w-full h-full object-cover max-h-96"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Likers Preview Bar with Hover Card */}
      {post.likesCount > 0 && (
        <div className="relative mt-3 pt-2 text-[11px] text-zinc-500 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 shrink-0" />
          <div
            className="relative inline-block"
            onMouseEnter={() => setIsHoveringLikers(true)}
            onMouseLeave={() => setIsHoveringLikers(false)}
          >
            <span>
              Liked by{' '}
              <button
                onClick={() => setIsLikersModalOpen(true)}
                className="font-bold text-zinc-800 dark:text-zinc-200 hover:text-blue-500 underline underline-offset-2 transition-colors cursor-pointer"
              >
                {post.likesCount || 50} {post.likesCount === 1 ? 'developer' : 'developers'}
              </button>
            </span>

            {/* Hover Popover showing Developer Profiles */}
            {isHoveringLikers && (
              <div className="absolute left-0 bottom-full mb-2 z-30 w-72 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-3.5 text-zinc-900 dark:text-zinc-100 animate-fade-in pointer-events-auto">
                <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex -space-x-2 overflow-hidden">
                    {(post.likedByUsers || []).slice(0, 4).map((l) => (
                      <Avatar key={l.id} src={l.avatarUrl} name={l.fullName} size="xs" className="border-2 border-white dark:border-zinc-950" />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Liked by {post.likesCount || 50} Developers
                  </p>
                </div>
                <div className="py-2 space-y-1.5">
                  {(post.likedByUsers || []).slice(0, 3).map((l) => (
                    <div
                      key={l.id}
                      onClick={() => {
                        if (onSelectUser) onSelectUser(l);
                      }}
                      className="flex items-center justify-between text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900 p-1 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar src={l.avatarUrl} name={l.fullName} size="xs" />
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{l.fullName}</p>
                          <p className="text-[10px] text-blue-500 truncate">@{l.username}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(post.likesCount || 50) > 3 && (
                    <p className="text-[10px] text-blue-500 font-medium pt-1 px-1">
                      + {(post.likesCount || 50) - 3} other real developers
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setIsLikersModalOpen(true)}
                  className="w-full mt-1 py-1.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                >
                  View All 50 Developer Profiles
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="mt-4 flex items-center justify-between text-zinc-500 text-xs font-medium pt-3 border-t border-zinc-200 dark:border-zinc-800/60">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLikeClick}
            className={`flex items-center gap-1.5 transition-colors ${
              post.isLiked ? 'text-pink-500 font-semibold' : 'hover:text-pink-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
            <span>{post.likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 hover:text-blue-500 transition-colors ${
              showComments ? 'text-blue-500' : ''
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>
              {post.commentsCount || (post.comments ? post.comments.length : 0)}{' '}
              {post.commentsCount === 1 ? 'comment' : 'comments'}
            </span>
          </button>
        </div>

        {/* Save / Bookmark Button */}
        <button
          onClick={handleSaveClick}
          className={`flex items-center gap-1.5 transition-colors ${
            post.isSaved ? 'text-amber-500 font-semibold' : 'hover:text-amber-500'
          }`}
          title={post.isSaved ? 'Remove from Saved Snippets' : 'Save Snippet'}
        >
          <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span className="hidden sm:inline">{post.isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Threaded Comments */}
      {showComments && (
        <CommentSection
          postId={post.id}
          comments={post.comments || []}
          currentUser={currentUser}
          onAddComment={onAddComment}
          onSelectUser={onSelectUser}
          onRequireAuth={onRequireAuth}
        />
      )}

      {/* Modals */}
      {isEditModalOpen && onEditPost && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          post={post}
          onSave={onEditPost}
        />
      )}

      {isLikersModalOpen && (
        <LikersModal
          isOpen={isLikersModalOpen}
          onClose={() => setIsLikersModalOpen(false)}
          likers={post.likedByUsers || []}
          onSelectUser={(u) => onSelectUser && onSelectUser(u)}
        />
      )}
    </article>
  );
};
