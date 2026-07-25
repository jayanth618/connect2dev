import React, { useState, useEffect } from 'react';
import { User, Post } from '../../types';
import { userService } from '../../services/userService';
import { getStoredUsers } from '../../services/authService';
import { Avatar } from '../common/Avatar';
import { PostCard } from '../feed/PostCard';
import { FollowersListModal } from './FollowersListModal';
import { EditProfileModal } from './EditProfileModal';
import {
  Calendar,
  Link as LinkIcon,
  Github,
  Users,
  Grid,
  Bookmark,
  Edit2,
  ArrowLeft,
  UserPlus,
  UserCheck,
} from 'lucide-react';

interface ProfileViewProps {
  profileUser: User;
  currentUser: User | null;
  userPosts: Post[];
  savedPosts?: Post[];
  onToggleLike: (postId: string) => void;
  onToggleSave?: (postId: string) => void;
  onEditPost?: (postId: string, content: string, imageUrl?: string) => Promise<any>;
  onDeletePost?: (postId: string) => Promise<any>;
  onAddComment: (postId: string, content: string) => Promise<any>;
  onUpdateProfile?: (updatedData: Partial<User>) => Promise<any>;
  onSelectUser?: (user: User) => void;
  onBackToFeed?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileUser,
  currentUser,
  userPosts,
  savedPosts = [],
  onToggleLike,
  onToggleSave,
  onEditPost,
  onDeletePost,
  onAddComment,
  onUpdateProfile,
  onSelectUser,
  onBackToFeed,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [followersModalTitle, setFollowersModalTitle] = useState<string | null>(null);
  const [followersUserIds, setFollowersUserIds] = useState<string[]>([]);
  const [displayedUser, setDisplayedUser] = useState<User>(profileUser);
  const [isFollowing, setIsFollowing] = useState<boolean>(
    Boolean(currentUser?.followingIds?.includes(profileUser.id))
  );

  useEffect(() => {
    const allStored = getStoredUsers();
    const fresh = allStored.find((u) => u.id === profileUser.id || u.username === profileUser.username) || profileUser;
    setDisplayedUser(fresh);
    setIsFollowing(Boolean(currentUser?.followingIds?.includes(fresh.id)));
  }, [profileUser, currentUser?.followingIds]);

  const isOwnProfile =
    currentUser?.id === displayedUser.id ||
    currentUser?.username === displayedUser.username ||
    (currentUser?.id === 'usr_1' && displayedUser.id === 'usr_1');

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Joined recently';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const handleOpenFollowers = () => {
    setFollowersModalTitle('Followers');
    setFollowersUserIds(displayedUser.followersIds || []);
  };

  const handleOpenFollowing = () => {
    setFollowersModalTitle('Following');
    setFollowersUserIds(displayedUser.followingIds || []);
  };

  const handleToggleFollow = async () => {
    if (!currentUser) return;
    try {
      const res = await userService.toggleFollowUser(currentUser.id, displayedUser.id);
      setDisplayedUser(res.targetUser);
      setIsFollowing(res.isFollowing);
    } catch (err) {
      console.error('Profile follow error:', err);
    }
  };

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100 w-full pb-12">
      {/* Back to feed button if viewing another user */}
      {onBackToFeed && (
        <button
          onClick={onBackToFeed}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors bg-white dark:bg-zinc-900/60 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </button>
      )}

      {/* Header Banner & Profile Info */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="h-36 sm:h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative p-4">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
            <div className="p-1 bg-white dark:bg-zinc-900 rounded-full w-fit shadow-md">
              <Avatar
                src={displayedUser.avatarUrl}
                name={displayedUser.fullName}
                size="xl"
                className="w-24 h-24 sm:w-32 sm:h-32 text-2xl font-bold"
              />
            </div>

            {isOwnProfile ? (
              onUpdateProfile && (
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-100 transition-all border border-zinc-200 dark:border-zinc-700 w-fit"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                  Edit Profile
                </button>
              )
            ) : (
              currentUser && (
                <button
                  onClick={handleToggleFollow}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm w-fit ${
                    isFollowing
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 shadow-md'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Connect</span>
                    </>
                  )}
                </button>
              )
            )}
          </div>

          <div className="space-y-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                {displayedUser.fullName}
              </h1>
              <p className="text-xs font-mono text-blue-500 font-medium">@{displayedUser.username}</p>
            </div>

            {displayedUser.role && (
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {displayedUser.role}
              </p>
            )}

            {displayedUser.bio && (
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
                {displayedUser.bio}
              </p>
            )}

            {/* Links and Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 font-medium pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {formatDate(displayedUser.createdAt)}</span>
              </div>

              {displayedUser.website && (
                <a
                  href={displayedUser.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-blue-500 hover:underline"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{displayedUser.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}

              {displayedUser.githubUrl && (
                <a
                  href={displayedUser.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-blue-500"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              )}
            </div>

            {/* Followers / Following Counters */}
            <div className="flex items-center gap-6 pt-2 text-xs font-semibold">
              <button
                onClick={handleOpenFollowers}
                className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-blue-500 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {displayedUser.followersCount}
                </span>{' '}
                Followers
              </button>

              <button
                onClick={handleOpenFollowing}
                className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-blue-500 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {displayedUser.followingCount}
                </span>{' '}
                Following
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 font-semibold text-xs bg-white dark:bg-zinc-900 rounded-2xl p-1 border shadow-sm">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'posts'
              ? 'bg-blue-600 text-white shadow'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Posts ({userPosts.length})</span>
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Snippets ({savedPosts.length})</span>
          </button>
        )}
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {activeTab === 'posts' ? (
          userPosts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs">
              No technical updates published yet.
            </div>
          ) : (
            userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onToggleLike={onToggleLike}
                onToggleSave={onToggleSave}
                onEditPost={onEditPost}
                onDeletePost={onDeletePost}
                onAddComment={onAddComment}
                onSelectUser={onSelectUser}
              />
            ))
          )
        ) : savedPosts.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs">
            No saved snippets yet. Click the bookmark icon on any post to save it for quick access.
          </div>
        ) : (
          savedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onToggleLike={onToggleLike}
              onToggleSave={onToggleSave}
              onEditPost={onEditPost}
              onDeletePost={onDeletePost}
              onAddComment={onAddComment}
              onSelectUser={onSelectUser}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {isEditProfileOpen && onUpdateProfile && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          currentUser={displayedUser}
          onSave={onUpdateProfile}
        />
      )}

      {followersModalTitle && (
        <FollowersListModal
          isOpen={Boolean(followersModalTitle)}
          onClose={() => setFollowersModalTitle(null)}
          title={followersModalTitle}
          userIds={followersUserIds}
          onSelectUser={(u) => onSelectUser && onSelectUser(u)}
        />
      )}
    </div>
  );
};
