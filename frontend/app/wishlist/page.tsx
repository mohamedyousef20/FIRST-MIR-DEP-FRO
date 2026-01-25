import { MainNav } from "@/components/main-nav"
import { WishlistPage } from "@/components/wishlist-page"

export default function Wishlist() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container px-4 py-6 md:py-10">
          <WishlistPage />
        </div>
      </main>
    </div>
  )
}
