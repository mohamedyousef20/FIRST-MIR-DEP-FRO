
import { NotificationsPage } from "@/components/notifications-page"

export default function Notifications() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container px-4 py-6 md:py-10">
          <NotificationsPage />
        </div>
      </main>
    </div>
  )
}
