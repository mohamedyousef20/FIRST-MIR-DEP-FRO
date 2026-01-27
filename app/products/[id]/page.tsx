import ProductDetail from "@/components/product-detail"
import { SiteFooter } from "@/components/site-footer"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <ProductDetail productId={id} />
      </main>
      <SiteFooter />
    </div>
  )
}
