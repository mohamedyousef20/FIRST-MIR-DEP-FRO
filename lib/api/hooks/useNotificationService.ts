'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { notificationService as baseNotificationService } from '../services/notificationService';

export const useNotificationService = () => {
  const { toast } = useToast();

  const handleApiError = useCallback((error: any, defaultMessage: string) => {
    const message = error.response?.data?.message || defaultMessage;
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
    throw new Error(message);
  }, [toast]);

  const showSuccessToast = useCallback((message: string) => {
    toast({
      title: 'Success',
      description: message,
    });
  }, [toast]);

  return {
    ...baseNotificationService,
    sendNotification: async (data: any) => {
      try {
        const response = await baseNotificationService.sendNotification(data);
        showSuccessToast('تم إرسال الإشعار بنجاح');
        return response;
      } catch (error: any) {
        return handleApiError(error, 'فشل في إرسال الإشعار');
      }
    },
    getNotifications: async () => {
      try {
        return await baseNotificationService.getNotifications();
      } catch (error: any) {
        handleApiError(error, 'فشل في جلب الإشعارات');
        return [];
      }
    },
    markAsRead: async (notificationId: string) => {
      try {
        return await baseNotificationService.markAsRead(notificationId);
      } catch (error: any) {
        handleApiError(error, 'فشل في تحديث حالة الإشعار');
        throw error;
      }
    },
    getUnreadCount: async () => {
      try {
        return await baseNotificationService.getUnreadCount();
      } catch (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }
    },
    markAllAsRead: async () => {
      try {
        await baseNotificationService.markAllAsRead();
        showSuccessToast('تم تحديد الكل كمقروء');
      } catch (error: any) {
        handleApiError(error, 'فشل في تحديد كل الإشعارات كمقروءة');
      }
    },
  };
};
