import { Community, CommunityMessage, User } from '../types';
import { INITIAL_COMMUNITIES, INITIAL_COMMUNITY_MESSAGES } from '../data/mockData';

const LOCAL_STORAGE_COMMUNITIES_KEY = 'connecthub_communities';
const LOCAL_STORAGE_MESSAGES_KEY = 'connecthub_community_messages';

export const getStoredCommunities = (): Community[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_COMMUNITIES_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_COMMUNITIES_KEY, JSON.stringify(INITIAL_COMMUNITIES));
    return INITIAL_COMMUNITIES;
  }
  return JSON.parse(data);
};

export const getStoredCommunityMessages = (): CommunityMessage[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(INITIAL_COMMUNITY_MESSAGES));
    return INITIAL_COMMUNITY_MESSAGES;
  }
  return JSON.parse(data);
};

export const communityService = {
  getCommunities(): Community[] {
    return getStoredCommunities();
  },

  getCommunityMessages(communityId: string): CommunityMessage[] {
    const messages = getStoredCommunityMessages();
    return messages.filter((m) => m.communityId === communityId);
  },

  addMessage(communityId: string, user: User, content: string, imageUrl?: string): CommunityMessage {
    const messages = getStoredCommunityMessages();
    const newMessage: CommunityMessage = {
      id: `msg_${Date.now()}`,
      communityId,
      userId: user.id,
      user,
      content,
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    messages.push(newMessage);
    localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(messages));
    return newMessage;
  }
};
