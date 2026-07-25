import { NotificationItem } from '../types';
import { INITIAL_NOTIFICATIONS } from '../data/mockData';

const LOCAL_STORAGE_NOTIFS_KEY = 'connecthub_notifications';

export const getStoredNotifications = (): NotificationItem[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_NOTIFS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_NOTIFS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  }
  return JSON.parse(data);
};

export const saveStoredNotifications = (notifs: NotificationItem[]) => {
  localStorage.setItem(LOCAL_STORAGE_NOTIFS_KEY, JSON.stringify(notifs));
};

export const notificationService = {
  getNotifications(): NotificationItem[] {
    return getStoredNotifications();
  },

  markAllAsRead(): NotificationItem[] {
    const notifs = getStoredNotifications();
    const updated = notifs.map((n) => ({ ...n, isRead: true }));
    saveStoredNotifications(updated);
    return updated;
  },

  markAsRead(id: string): NotificationItem[] {
    const notifs = getStoredNotifications();
    const updated = notifs.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    saveStoredNotifications(updated);
    return updated;
  }
};
