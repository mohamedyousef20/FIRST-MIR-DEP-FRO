import { ProductGrid } from "@/components/product-grid"
import { SiteFooter } from "@/components/site-footer"
import { HeroCarousel } from "@/components/hero-carousel"
import { CategorySection } from "@/components/category-section"
import { BrandSection } from "@/components/brand-section"
// import { DiscountBanner } from "@/components/discount-banner"
import dynamic from 'next/dynamic';
import { FeaturedProducts } from "@/components/featured-products"
import { NewestProducts } from "@/components/newest-product"
import { getUserServer } from "@/src/lib/getUserServer"
import { User } from "lucide-react"


import { redirect } from "next/navigation"

export default async function Home() {
  // Server-side user fetch
  const user = await getUserServer();
  if (user?.role === 'seller') {
    redirect('/vendor/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <HeroCarousel />
        <div className="container px-4 py-6 md:py-10">
          <CategorySection />
          <FeaturedProducts title="منتجات مميزة" />
          {/* <DiscountBanner /> */}
          <BrandSection />
          <NewestProducts title="وصل حديثاً" />
          <ProductGrid />
        </div>
      </main>
    </div>
  )
}
