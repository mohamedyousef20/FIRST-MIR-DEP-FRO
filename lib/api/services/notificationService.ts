import apiServices from '@/lib/api';

const { api } = apiServices;

export type NotificationType =
  | 'ORDER_PLACED'
  | 'ORDER_SHIPPED'
  | 'ORDER_COMPLETED'
  | 'PAYOUT_COMPLETED'
  | 'ORDER_DELIVERED'
  | 'RETURN_REQUESTED'
  | 'NEW_ANNOUNCEMENT'
  | 'CUSTOM'
  | 'ALL_USERS';

export type UserRole = 'admin' | 'seller' | 'user';

export interface Notification {
  _id: string;
  user?: string;
  actor?: string;
  role?: UserRole;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  link?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  status?: 'sent' | 'failed';
  userIds?: string[];
}

interface SendNotificationData {
  title: string;
  message: string;
  type: NotificationType;
  userIds?: string[];
  role?: UserRole;
  orderId?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  notifications?: Notification[];
  count?: number;
}

const handleApiError = (error: any) => {
  const message = error.response?.data?.message || error.message || 'An error occurred';
  throw new Error(message);
};

// Base notification service - just handles API calls
export const notificationService = {
  // Send a new notification (Admin only)
  async sendNotification(data: SendNotificationData): Promise<ApiResponse<Notification[]>> {
    try {
      const response = await api.post('/api/notifications/send', data);
      return response.data;
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  // Get all notifications for the current user
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get('/api/notifications');
      return response.data;
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  // Mark a notification as read
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const response = await api.patch(`/api/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  // Get count of unread notifications
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/api/notifications/unread-count');
      return response.data.count || 0;
    } catch (error: any) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      await api.patch('/api/notifications/read-all');
    } catch (error: any) {
      handleApiError(error);
    }
  }
};
