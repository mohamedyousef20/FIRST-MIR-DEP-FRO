"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/components/language-provider";
import { notificationService, type NotificationType } from "@/lib/api/services/notificationService"
import { toast } from "sonner"

type NotificationTarget = 'all_users' | 'specific_users' | 'all_sellers' | 'specific_sellers'

export function BulkNotification() {
  const { language, t } = useLanguage()
  const isArabic = language === "ar"
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [target, setTarget] = useState<NotificationTarget>("all_users")
  const [userIds, setUserIds] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let notificationData: {
        title: string
        message: string
        type: NotificationType
        userIds?: string[]
        role?: 'seller' | 'user'
      } = {
        title,
        message,
        type: 'CUSTOM'
      }

      // Set the appropriate data based on the target
      switch (target) {
        case 'all_users':
          notificationData.role = 'user'
          notificationData.type = 'ALL_USERS'
          break
        case 'specific_users':
          notificationData.userIds = userIds.split(',').map(id => id.trim())
          notificationData.role = 'user'
          break
        case 'all_sellers':
          notificationData.role = 'seller'
          notificationData.type = 'ALL_USERS'
          break
        case 'specific_sellers':
          notificationData.userIds = userIds.split(',').map(id => id.trim())
          notificationData.role = 'seller'
          break
      }

      await notificationService.sendNotification(notificationData)
      toast.success(isArabic ? "تم إرسال الإشعارات بنجاح" : "Notifications sent successfully")

      // Reset form
      setIsModalOpen(false)
      setTitle("")
      setMessage("")
      setUserIds("")
      setTarget("all_users")
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error(isArabic ? "فشل إرسال الإشعارات" : "Failed to send notifications")
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setIsModalOpen(true)}
        className="w-full"
      >
        {isArabic ? "إرسال إشعارات" : "Send Notifications"}
      </Button>

      {isModalOpen && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>
              {isArabic ? "إرسال إشعارات" : "Send Notifications"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">
                  {isArabic ? "عنوان الإشعار" : "Notification Title"} *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">
                  {isArabic ? "محتوى الإشعار" : "Notification Message"} *
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label>
                  {isArabic ? "إرسال إلى" : "Send To"} *
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="all_users"
                      name="target"
                      value="all_users"
                      checked={target === "all_users"}
                      onChange={() => setTarget("all_users")}
                      className="h-4 w-4"
                    />
                    <label htmlFor="all_users" className="text-sm">
                      {isArabic ? "جميع المستخدمين" : "All Users"}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="specific_users"
                      name="target"
                      value="specific_users"
                      checked={target === "specific_users"}
                      onChange={() => setTarget("specific_users")}
                      className="h-4 w-4"
                    />
                    <label htmlFor="specific_users" className="text-sm">
                      {isArabic ? "مستخدمين محددين" : "Specific Users"}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="all_sellers"
                      name="target"
                      value="all_sellers"
                      checked={target === "all_sellers"}
                      onChange={() => setTarget("all_sellers")}
                      className="h-4 w-4"
                    />
                    <label htmlFor="all_sellers" className="text-sm">
                      {isArabic ? "جميع البائعين" : "All Sellers"}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="specific_sellers"
                      name="target"
                      value="specific_sellers"
                      checked={target === "specific_sellers"}
                      onChange={() => setTarget("specific_sellers")}
                      className="h-4 w-4"
                    />
                    <label htmlFor="specific_sellers" className="text-sm">
                      {isArabic ? "بائعين محددين" : "Specific Sellers"}
                    </label>
                  </div>
                </div>
              </div>

              {(target === "specific_users" || target === "specific_sellers") && (
                <div>
                  <Label htmlFor="userIds">
                    {isArabic
                      ? target === "specific_users" ? "معرفات المستخدمين" : "معرفات البائعين"
                      : target === "specific_users" ? "User IDs" : "Seller IDs"} *
                  </Label>
                  <Input
                    id="userIds"
                    value={userIds}
                    onChange={(e) => setUserIds(e.target.value)}
                    placeholder={
                      isArabic
                        ? target === "specific_users"
                          ? "أدخل معرفات المستخدمين مفصولة بفواصل"
                          : "أدخل معرفات البائعين مفصولة بفواصل"
                        : target === "specific_users"
                          ? "Enter user IDs separated by commas"
                          : "Enter seller IDs separated by commas"
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {isArabic
                      ? "أدخل المعرفات مفصولة بفاصلة (مثال: 123, 456, 789)"
                      : "Enter IDs separated by commas (e.g., 123, 456, 789)"}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  {isArabic ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit">
                  {isArabic ? "إرسال" : "Send"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
