import api from '../../../shared/lib/axios';
import type { INotification } from '../types/notification.types';

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: INotification[];
  meta?: { page: number; limit: number };
}

export interface UnreadCountResponse {
  success: boolean;
  data: { count: number };
}

export const notificationApi = {
  getNotifications: async (page = 1, limit = 20): Promise<NotificationsResponse> => {
    const response = await api.get('/notifications', { params: { page, limit } });
    return response.data;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<{ data: INotification }> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },
};
