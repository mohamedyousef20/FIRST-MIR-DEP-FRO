"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider";
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { toast } from 'sonner'
import { categoryService } from "@/lib/api"

interface Category {
  _id: string;
  name: {
    ar: string;
    en: string;
  };
  image: string;
}

export function CategorySection() {
  const { language } = useLanguage()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const categories = await categoryService.getCategories();
        setCategories(categories.data)
      } catch (err: any) {
        setError(err.categories?.data?.message || 'Failed to fetch categories')
        toast.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <section className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            {language === "ar" ? "تسوق حسب الفئة" : "Shop by Category"}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories?.map((_, idx) => (
            <Card key={idx} className="animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <CardContent className="p-4">
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded" />
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
            {language === "ar" ? "تسوق حسب الفئة" : "Shop by Category"}
          </h2>
        </div>
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      </section>
    )
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          {language === "ar" ? "تسوق حسب الفئة" : "Shop by Category"}
        </h2>
        <Link href="/categories" className="text-sm font-medium text-primary hover:underline">
          {language === "ar" ? "عرض الكل" : "View All"}
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Link key={category._id} href={`/categories/${category._id}/products`}>
            <Card className="overflow-hidden transition-all hover:shadow-md">
              <div className="aspect-square relative">
                {
                  /* Compute alternative text safely to avoid undefined */
                }
                <Image
                  src={category.image || '/placeholder.svg'}
                  alt={(() => {
                    const primary = language === 'ar' ? category.name?.ar : category.name?.en;
                    const secondary = language === 'ar' ? category.name?.en : category.name?.ar;
                    return primary || secondary || 'Category image';
                  })()}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '/placeholder.svg';
                  }}
                />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-medium">{language === "ar" ? category.name.ar : category.name.en}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
