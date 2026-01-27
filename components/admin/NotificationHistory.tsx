"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { notificationService } from "@/lib/api/services/notificationService";
import { useLanguage } from "@/components/language-provider";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'all' | 'specific';
  userIds?: string[];
  createdAt: string;
  status: 'sent' | 'failed';
}

export function NotificationHistory() {
  const { language, t } = useLanguage();
  const isArabic = language === "ar";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotificationHistory();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-4">{isArabic ? "جاري التحميل..." : "Loading..."}</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {isArabic ? "سجل الإشعارات" : "Notification History"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isArabic ? "العنوان" : "Title"}</TableHead>
                <TableHead>{isArabic ? "نوع الإشعار" : "Type"}</TableHead>
                <TableHead>{isArabic ? "التاريخ" : "Date"}</TableHead>
                <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                <TableHead>{isArabic ? "المستخدمين" : "Users"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>{notification.title}</TableCell>
                  <TableCell>
                    {notification.type === 'all'
                      ? (isArabic ? "لجميع المستخدمين" : "All Users")
                      : (isArabic ? "مستخدمين محددين" : "Specific Users")}
                  </TableCell>
                  <TableCell>
                    {new Date(notification.createdAt).toLocaleDateString(
                      isArabic ? 'ar-SA' : 'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(notification.status)}>
                      {notification.status === 'sent'
                        ? (isArabic ? "تم الإرسال" : "Sent")
                        : (isArabic ? "فشل" : "Failed")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {notification.type === 'specific' && notification.userIds?.length
                      ? `${notification.userIds.length} ${isArabic ? "مستخدم" : "users"}`
                      : ""
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
