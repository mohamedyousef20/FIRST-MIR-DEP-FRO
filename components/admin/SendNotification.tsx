"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { notificationService } from "@/lib/api/services/notificationService";
import { useLanguage } from "@/components/language-provider";

interface SendNotificationProps {
  onNotificationSent?: () => void;
}

export function SendNotification({ onNotificationSent }: SendNotificationProps) {
  const { language, t } = useLanguage();
  const isArabic = language === "ar";
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "all",
    userIds: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format the data for the API
      const notificationData: Parameters<typeof notificationService.sendNotification>[0] = {
        title: formData.title,
        message: formData.message,
        type: formData.type === 'all' ? 'ALL_USERS' : 'CUSTOM',
        userIds: formData.type === 'specific' ? formData.userIds : undefined
      };

      await notificationService.sendNotification(notificationData);
      toast.success(isArabic ? "تم إرسال الإشعار بنجاح" : "Notification sent successfully");

      if (onNotificationSent) {
        onNotificationSent();
      }

      // Reset form
      setFormData({
        title: "",
        message: "",
        type: "all",
        userIds: [],
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
        (isArabic ? "فشل في إرسال الإشعار" : "Failed to send notification");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {isArabic ? "إرسال إشعار" : "Send Notification"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">
              {isArabic ? "عنوان الإشعار" : "Notification Title"}
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={isArabic ? "أدخل عنوان الإشعار" : "Enter notification title"}
              required
              dir={isArabic ? "rtl" : "ltr"}
            />
          </div>

          <div>
            <Label htmlFor="message">
              {isArabic ? "محتوى الإشعار" : "Notification Message"}
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder={isArabic ? "أدخل محتوى الإشعار" : "Enter notification message"}
              required
              dir={isArabic ? "rtl" : "ltr"}
            />
          </div>

          <div>
            <Label htmlFor="type">
              {isArabic ? "نوع الإشعار" : "Notification Type"}
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={isArabic ? "اختر نوع الإشعار" : "Select notification type"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {isArabic ? "لجميع المستخدمين" : "Send to all users"}
                </SelectItem>
                <SelectItem value="specific">
                  {isArabic ? "لمستخدمين محددين" : "Send to specific users"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === "specific" && (
            <div>
              <Label>
                {isArabic ? "المستخدمين" : "Users"}
              </Label>
              <Input
                placeholder={isArabic ? "أدخل معرفات المستخدمين (مفصولة بفواصل)" : "Enter user IDs (comma separated)"}
                onChange={(e) => {
                  const userIds = e.target.value.split(",").map(id => id.trim());
                  setFormData(prev => ({ ...prev, userIds }));
                }}
                dir={isArabic ? "rtl" : "ltr"}
              />
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ?
              (isArabic ? "جاري الإرسال..." : "Sending...") :
              (isArabic ? "إرسال" : "Send")
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
