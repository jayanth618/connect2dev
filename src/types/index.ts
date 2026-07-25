export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  githubUrl?: string;
  role?: string;
  followersCount: number;
  followingCount: number;
  followersIds?: string[];
  followingIds?: string[];
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  likedByUsers?: User[];
  comments?: Comment[];
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  actor: User;
  type: 'like' | 'comment' | 'follow' | 'mention';
  postSummary?: string;
  postId?: string;
  createdAt: string;
  isRead: boolean;
}

export interface CommunityMessage {
  id: string;
  communityId: string;
  userId: string;
  user: User;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  subscribersCount: string;
  topics: string[];
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
