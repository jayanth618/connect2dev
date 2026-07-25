import React, { useState } from 'react';
import { Post, User } from '../../types';
import { PostCard } from '../feed/PostCard';
import { Avatar } from '../common/Avatar';
import { Hash, Search, Sparkles, TrendingUp, Filter, Users, X } from 'lucide-react';

interface ExploreViewProps {
  posts: Post[];
  currentUser: User | null;
  initialTag?: string | null;
  onToggleLike: (postId: string) => void;
  onToggleSave?: (postId: string) => void;
  onEditPost?: (postId: string, content: string, imageUrl?: string) => Promise<any>;
  onDeletePost?: (postId: string) => Promise<any>;
  onAddComment: (postId: string, content: string) => Promise<any>;
  onSelectUser: (user: User) => void;
  onRequireAuth?: () => void;
}

const FEATURED_TAGS = [
  { tag: '#NextJS15', label: 'Next.js 15', category: 'Frameworks', count: '14.2k' },
  { tag: '#SOLID_Principles', label: 'SOLID Principles', category: 'Software Architecture', count: '8.5k' },
  { tag: '#SupabaseEdge', label: 'Supabase Edge', category: 'Cloud Architecture', count: '3.1k' },
  { tag: '#TypeScript_5_8', label: 'TypeScript 5.8', category: 'Type Safety', count: '19.4k' },
  { tag: '#React19', label: 'React 19', category: 'Frontend', count: '18.9k' },
  { tag: '#PostgreSQL', label: 'PostgreSQL & SQL', category: 'Database', count: '12.5k' },
  { tag: '#Rust', label: 'Rust & Tokio', category: 'Systems', count: '9.8k' },
  { tag: '#AI_Gemini', label: 'Gemini 1.5 API', category: 'AI & ML', count: '16.4k' },
  { tag: '#DevOps', label: 'Kubernetes & Docker', category: 'Infrastructure', count: '15.3k' },
  { tag: '#CleanCode', label: 'Clean Architecture', category: 'Software Design', count: '7.4k' },
];

export const ExploreView: React.FC<ExploreViewProps> = ({
  posts,
  currentUser,
  initialTag,
  onToggleLike,
  onToggleSave,
  onEditPost,
  onDeletePost,
  onAddComment,
  onSelectUser,
  onRequireAuth,
}) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag || null);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    if (initialTag !== undefined) {
      setSelectedTag(initialTag);
    }
  }, [initialTag]);

  // Filter posts by selected tag or search query
  const filteredPosts = posts.filter((post) => {
    let matchesTag = true;
    if (selectedTag) {
      const tagClean = selectedTag.replace('#', '').toLowerCase();
      matchesTag = post.content.toLowerCase().includes(tagClean);
    }

    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      matchesSearch =
        post.content.toLowerCase().includes(q) ||
        post.user.fullName.toLowerCase().includes(q) ||
        post.user.username.toLowerCase().includes(q) ||
        (post.user.role && post.user.role.toLowerCase().includes(q));
    }

    return matchesTag && matchesSearch;
  });

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100 w-full pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wider uppercase">
            <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
            Explore Tech Topics & Snippets
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Discover Trending Developer Discussions & Stack Tags
          </h1>
          <p className="text-xs text-blue-100 leading-relaxed max-w-xl">
            Filter technical feed updates by framework hashtags, language architectures, and database benchmarks.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search technical discussions, code snippets, or framework tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
        />
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tag Pills Grid */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-blue-500" />
            Trending Tech Stack Tags
          </h3>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Clear tag filter
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {FEATURED_TAGS.map((item) => {
            const isActive = selectedTag === item.tag;
            return (
              <button
                key={item.tag}
                onClick={() => setSelectedTag(isActive ? null : item.tag)}
                className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-zinc-50 dark:bg-zinc-950/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <span>{item.tag}</span>
                <span className={`text-[10px] ${isActive ? 'text-blue-200' : 'text-zinc-400'}`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter status banner */}
      {(selectedTag || searchQuery) && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 p-3 rounded-xl text-xs text-blue-700 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-500" />
            <span>
              Showing results for{' '}
              {selectedTag && <strong className="font-bold">{selectedTag}</strong>}
              {selectedTag && searchQuery && ' and '}
              {searchQuery && <strong className="font-bold">"{searchQuery}"</strong>}
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedTag(null);
              setSearchQuery('');
            }}
            className="font-bold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Feed List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
            {selectedTag ? `Posts tagged with ${selectedTag}` : 'Explore Technical Feed'}
          </h2>
          <span className="text-xs text-zinc-500 font-mono">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
          </span>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-zinc-500 text-xs space-y-2">
            <Hash className="w-8 h-8 mx-auto text-zinc-400 opacity-50" />
            <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">
              No technical posts found matching this topic.
            </p>
            <p>Try selecting another tag pill or clear your search filter above.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
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
              onRequireAuth={onRequireAuth}
            />
          ))
        )}
      </div>
    </div>
  );
};
