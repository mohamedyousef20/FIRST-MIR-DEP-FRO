'use client';

import { Button } from "./ui/button";
import { useNotificationService } from "@/lib/api/hooks/useNotificationService";

export default function ToastTest() {
  const notificationService = useNotificationService();

  const testSuccessToast = () => {
    notificationService.sendNotification({
      title: 'Test Notification',
      message: 'This is a test success message',
      type: 'CUSTOM',
      role: 'user'
    }).catch(console.error);
  };

  const testErrorToast = async () => {
    try {
      // This will trigger an error since we're not providing required fields
      await notificationService.sendNotification({} as any);
    } catch (error) {
      // Error is already handled by the notification service
      console.error('Test error:', error);
    }
  };

  return (
    <div className="flex gap-4 p-4">
      <Button onClick={testSuccessToast}>
        Test Success Toast
      </Button>
      <Button variant="destructive" onClick={testErrorToast}>
        Test Error Toast
      </Button>
    </div>
  );
}
