"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider";
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { toast } from 'sonner'
import { brandService } from "@/lib/api"

interface Brand {
  _id: string;
  name: {
    ar: string;
    en: string;
  } | string; // يمكن أن يكون كائن أو نص عادي
  image: string;
  slug?: string;
}

export function BrandSection() {
  const { language } = useLanguage()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await brandService.getBrands();
        setBrands(response.data || [])
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch brands'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  if (loading) {
    return (
      <section className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            {language === "ar" ? "تسوق حسب الماركة" : "Shop by Brand"}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, idx) => (
            <Card key={idx} className="animate-pulse">
              <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                <div className="relative h-12 w-full mb-2 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            {language === "ar" ? "تسوق حسب الماركة" : "Shop by Brand"}
          </h2>
        </div>
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      </section>
    )
  }

  if (brands.length === 0) {
    return (
      <section className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            {language === "ar" ? "تسوق حسب الماركة" : "Shop by Brand"}
          </h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          {language === "ar" ? "لا توجد ماركات متاحة حالياً" : "No brands available at the moment"}
        </div>
      </section>
    )
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          {language === "ar" ? "تسوق حسب الماركة" : "Shop by Brand"}
        </h2>
        <Link href="/brands" className="text-sm font-medium text-primary hover:underline">
          {language === "ar" ? "عرض الكل" : "View All"}
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {brands.map((brand) => {
          // التعامل مع اسم الماركة سواء كان كائن ترجمة أو نص عادي
          const brandName = typeof brand.name === 'string'
            ? brand.name
            : language === "ar"
              ? brand.name.ar
              : brand.name.en;

          // بناء رابط المنتجات بناءً على الماركة
          const brandLink = brand.slug
            ? `/brands/${brand.slug}`
            : `/products?brand=${brand._id}`;

          return (
            <Link key={brand._id} href={brandLink}>
              <Card className="overflow-hidden transition-all hover:shadow-md h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                  <div className="relative h-12 w-full mb-3">
                    <Image
                      src={brand.image || "/placeholder.svg"}
                      alt={brandName || "Brand image"}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <h3 className="font-medium text-sm text-center mb-1 line-clamp-1">
                    {brandName}
                  </h3>
               
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}