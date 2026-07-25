import React, { useState, useRef } from 'react';
import { User } from '../../types';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Image as ImageIcon, Link as LinkIcon, X } from 'lucide-react';

interface CreatePostCardProps {
  currentUser: User | null;
  onCreatePost: (content: string, imageUrl?: string) => Promise<any>;
  onRequireAuth?: () => void;
}

export const CreatePostCard: React.FC<CreatePostCardProps> = ({
  currentUser,
  onCreatePost,
  onRequireAuth,
}) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) return;

    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreatePost(content.trim(), imageUrl || undefined);
      setContent('');
      setImageUrl('');
      setShowImageUrlInput(false);
    } catch (err) {
      console.error('Create post failed:', err);
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

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar src={currentUser?.avatarUrl} name={currentUser?.fullName || 'Guest'} size="md" />
          <div className="flex-1">
            <textarea
              placeholder={
                currentUser
                  ? "What's the latest in your stack? Share code, ideas, or project updates..."
                  : "Sign in to share project updates, code, and thoughts with fellow developers..."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onClick={() => {
                if (!currentUser && onRequireAuth) onRequireAuth();
              }}
              rows={3}
              className="w-full bg-transparent border-none focus:ring-0 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 resize-none text-sm leading-relaxed p-0 focus:outline-none"
            />

            {/* Image Preview */}
            {imageUrl && (
              <div className="relative mt-2 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-48 w-fit bg-zinc-950">
                <img src={imageUrl} alt="Attachment preview" className="max-h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1 rounded-full backdrop-blur-sm transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* URL Input */}
            {showImageUrlInput && (
              <div className="mt-2 flex gap-2 items-center">
                <input
                  type="url"
                  placeholder="Paste image URL (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-1.5 px-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowImageUrlInput(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 px-2"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
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
              className="p-2 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-lg transition-all flex items-center gap-1.5 text-xs"
              title="Upload Image"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Image</span>
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
              className="p-2 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-lg transition-all flex items-center gap-1.5 text-xs"
              title="Add Image Link"
            >
              <LinkIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Image Link</span>
            </button>
          </div>

          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting}
            disabled={(!content.trim() && !imageUrl) || !currentUser}
          >
            Post Update
          </Button>
        </div>
      </form>
    </div>
  );
};
