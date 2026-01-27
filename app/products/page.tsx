import { MainNav } from "@/components/main-nav"
import { ProductGrid } from "@/components/product-grid"
import { SiteFooter } from "@/components/site-footer"

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container px-4 py-6 md:py-10">
          <ProductGrid />
        </div>
      </main>
    </div>
  )
}
