import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { RightSidebar } from './components/common/RightSidebar';
import { CreatePostCard } from './components/feed/CreatePostCard';
import { PostCard } from './components/feed/PostCard';
import { ProfileView } from './components/profile/ProfileView';
import { DeveloperNetworkView } from './components/network/DeveloperNetworkView';
import { ExploreView } from './components/explore/ExploreView';
import { AuthModal } from './components/auth/AuthModal';
import { UserSearchModal } from './components/search/UserSearchModal';
import { CommunityChatModal } from './components/community/CommunityChatModal';
import { usePosts } from './hooks/usePosts';
import { useProfile } from './hooks/useProfile';
import { communityService } from './services/communityService';
import { User, Community, Post } from './types';
import { Bookmark, Sparkles } from 'lucide-react';

function ConnectHubApp() {
  const { user, updateUserSession } = useAuth();
  const {
    posts,
    savedPosts,
    isLoading,
    createPost,
    editPost,
    deletePost,
    toggleSave,
    toggleLike,
    addComment,
    refreshPosts,
  } = usePosts(user);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'network' | 'saved' | 'profile'>('home');
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [selectedExploreTag, setSelectedExploreTag] = useState<string | null>(null);

  // Communities Modal state
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);

  useEffect(() => {
    setAllCommunities(communityService.getCommunities());
  }, []);

  // Target ID for ProfileView
  const targetUserId = viewingUser?.id || user?.id || null;
  const {
    profile,
    userPosts,
    updateProfile,
    refreshProfile,
  } = useProfile(activeTab === 'profile' ? targetUserId : null);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleRequireAuth = () => {
    handleOpenAuth('login');
  };

  const handleSelectUser = (selectedUser: User) => {
    setViewingUser(selectedUser);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenOwnProfile = () => {
    if (!user) {
      handleRequireAuth();
      return;
    }
    setViewingUser(user);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateProfile = async (updates: Partial<User>) => {
    const updated = await updateProfile(updates);
    if (updated) {
      updateUserSession(updated);
      if (viewingUser && (viewingUser.id === updated.id || viewingUser.username === updated.username)) {
        setViewingUser(updated);
      }
    }
    refreshPosts();
    return updated;
  };

  const handleOpenCommunity = (community: Community) => {
    setActiveCommunity(community);
    setIsCommunityModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col antialiased transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onOpenAuthModal={handleOpenAuth}
        onSearchClick={() => setIsSearchModalOpen(true)}
        onHomeClick={() => {
          setActiveTab('home');
          setViewingUser(null);
        }}
        onProfileClick={handleOpenOwnProfile}
        onSelectUserProfile={handleSelectUser}
        onNewPostClick={() => {
          if (!user) {
            handleRequireAuth();
          } else {
            setActiveTab('home');
            setViewingUser(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

      <div className="flex-1 w-full px-2 sm:px-4 flex items-start">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabSelect={(tab) => {
            setActiveTab(tab as any);
            setViewingUser(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSearchOpen={() => setIsSearchModalOpen(true)}
          onSelectCommunity={handleOpenCommunity}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 border-r border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 space-y-6">
          {activeTab === 'profile' && profile ? (
            <ProfileView
              profileUser={profile}
              currentUser={user}
              userPosts={userPosts}
              savedPosts={savedPosts}
              onToggleLike={toggleLike}
              onToggleSave={toggleSave}
              onEditPost={editPost}
              onDeletePost={deletePost}
              onAddComment={addComment}
              onUpdateProfile={handleUpdateProfile}
              onSelectUser={handleSelectUser}
              onBackToFeed={() => {
                setActiveTab('home');
                setViewingUser(null);
              }}
            />
          ) : activeTab === 'network' ? (
            /* Developer Network (LinkedIn style) */
            <DeveloperNetworkView
              currentUser={user}
              onSelectUser={handleSelectUser}
              onRequireAuth={handleRequireAuth}
            />
          ) : activeTab === 'explore' ? (
            /* Explore Tags & Technical Feed */
            <ExploreView
              posts={posts}
              currentUser={user}
              initialTag={selectedExploreTag}
              onToggleLike={toggleLike}
              onToggleSave={toggleSave}
              onEditPost={editPost}
              onDeletePost={deletePost}
              onAddComment={addComment}
              onSelectUser={handleSelectUser}
              onRequireAuth={handleRequireAuth}
            />
          ) : activeTab === 'saved' ? (
            /* Saved Snippets View */
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Saved Snippets & Bookmarks
                  </h2>
                </div>
                <span className="text-xs text-zinc-500 font-mono">
                  {savedPosts.length} saved
                </span>
              </div>

              {savedPosts.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-zinc-500 text-xs space-y-2">
                  <Bookmark className="w-8 h-8 text-zinc-400 mx-auto opacity-50" />
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">
                    No saved snippets yet
                  </p>
                  <p>Click the bookmark icon on any post in your feed to save it here for reference.</p>
                </div>
              ) : (
                savedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={user}
                    onToggleLike={toggleLike}
                    onToggleSave={toggleSave}
                    onEditPost={editPost}
                    onDeletePost={deletePost}
                    onAddComment={addComment}
                    onSelectUser={handleSelectUser}
                    onRequireAuth={handleRequireAuth}
                  />
                ))
              )}
            </section>
          ) : (
            /* Home Feed View */
            <>
              {/* Post Compose Card */}
              <CreatePostCard
                currentUser={user}
                onCreatePost={createPost}
                onRequireAuth={handleRequireAuth}
              />

              {/* Developer Activity Feed */}
              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                    Developer Activity Feed
                  </h2>
                  <span className="text-xs text-zinc-500 font-mono">
                    {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                  </span>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 animate-pulse space-y-4"
                      >
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                          <div className="space-y-2 flex-1">
                            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
                            <div className="h-2 bg-zinc-200/60 dark:bg-zinc-800/60 rounded w-1/6" />
                          </div>
                        </div>
                        <div className="h-12 bg-zinc-200/40 dark:bg-zinc-800/40 rounded" />
                      </div>
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-6 text-zinc-500 text-sm">
                    No updates posted yet. Be the first developer to share something!
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={user}
                      onToggleLike={toggleLike}
                      onToggleSave={toggleSave}
                      onEditPost={editPost}
                      onDeletePost={deletePost}
                      onAddComment={addComment}
                      onSelectUser={handleSelectUser}
                      onRequireAuth={handleRequireAuth}
                    />
                  ))
                )}
              </section>
            </>
          )}
        </main>

        {/* Right Sidebar */}
        <RightSidebar
          currentUser={user}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onSelectUser={handleSelectUser}
          onSelectTopicTag={(tag) => {
            setSelectedExploreTag(tag);
            setActiveTab('explore');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
      />

      {/* Global User Search Modal */}
      <UserSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        currentUser={user}
        onSelectUser={handleSelectUser}
      />

      {/* Community Chat / Discussion Hub Modal */}
      <CommunityChatModal
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
        community={activeCommunity}
        allCommunities={allCommunities}
        onSelectCommunity={(c) => setActiveCommunity(c)}
        currentUser={user}
        onRequireAuth={handleRequireAuth}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ConnectHubApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
