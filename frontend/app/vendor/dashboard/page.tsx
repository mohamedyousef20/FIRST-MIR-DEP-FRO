import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { VendorDashboard } from "@/components/vendor-dashboard"

export default function VendorDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <VendorDashboard />
      </main>
    </div>
  )
}
