import { SiteFooter } from "@/components/site-footer"
import { CartPage } from "@/components/cart-page"

export default function Cart() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container px-4 py-6 md:py-10">
          <CartPage />
        </div>
      </main>
    </div>
  )
}
