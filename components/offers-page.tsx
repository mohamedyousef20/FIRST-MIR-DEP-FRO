"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Star, Copy, Check, Percent } from "lucide-react"
import { cartService, productService } from "@/lib/api"
import couponService from "@/lib/api/services/couponService"
import { MirvoryPageLoader } from "./MirvoryLoader"
import { toast } from "sonner"
import { ProductCard } from "./ProductCard"

interface Coupon {
  _id: string
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minPurchaseAmount?: number
  maxDiscountAmount?: number
  validFrom?: string
  validUntil?: string
  isActive: boolean
}

interface DiscountProduct {
  _id: string
  title: string
  description: string
  price: number
  discountPercentage: number
  discountedPrice: number
  images?: string[]
  ratingsAverage?: number
  ratingsQuantity?: number
  category?: {
    _id: string
    name?: string
    nameEn?: string
  }
  createdAt?: string
}

export function OffersPage() {
  const { language } = useLanguage()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("discounts")
  const [discountProducts, setDiscountProducts] = useState<DiscountProduct[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const toggleWishlist = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
      } else {
        newFavorites.add(productId)
      }
      return newFavorites
    })
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => {
      setCopiedCode(null)
    }, 2000)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [productsResponse, couponsResponse] = await Promise.all([
          productService.getProducts({ limit: 12, sort: "-discountPercentage" }),
          couponService.getPublicCoupons()
        ])

        const productsData = productsResponse.data?.products || productsResponse.data || []
        setDiscountProducts(Array.isArray(productsData) ? productsData : [])
        const couponList = couponsResponse.data?.coupons || couponsResponse.data || []
        setCoupons(Array.isArray(couponList) ? couponList : [])
      } catch (err: any) {
        console.error("Failed to load offers data", err)
        const message = err?.response?.data?.message || (language === "ar" ? "فشل تحميل العروض" : "Failed to load offers")
        setError(message)
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [language])

  const productsWithDiscount = useMemo(() =>
    discountProducts.filter((product) => (product.discountPercentage || 0) > 0),
    [discountProducts]
  )

  const handleAddToCart = async (productId: string) => {
    try {
      await cartService.addToCart({ productId, quantity: 1 })
      toast.success(language === "ar" ? "تمت إضافة المنتج إلى السلة" : "Added to cart")
    } catch (err: any) {
      const message = err?.response?.data?.message || (language === "ar" ? "فشل إضافة المنتج" : "Failed to add product")
      toast.error(message)
    }
  }

  if (isLoading) {
    return <MirvoryPageLoader text={language === "ar" ? "جاري تحميل العروض..." : "Loading offers..."} />
  }

  if (error) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()}>
          {language === "ar" ? "إعادة المحاولة" : "Retry"}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-4">
          {language === "ar" ? "العروض والخصومات" : "Offers & Discounts"}
        </h1>
        <p className="text-muted-foreground mb-6">
          {language === "ar"
            ? "استكشف أفضل العروض والخصومات على منتجاتنا. خصومات حصرية، كوبونات، وشحن مجاني!"
            : "Explore our best offers and discounts on our products. Exclusive discounts, coupons, and free shipping!"}
        </p>
      </div>

      <Tabs defaultValue="discounts" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="discounts">{language === "ar" ? "المنتجات المخفضة" : "Discounted Products"}</TabsTrigger>
          <TabsTrigger value="coupons">{language === "ar" ? "كوبونات الخصم" : "Discount Coupons"}</TabsTrigger>
        </TabsList>

        <TabsContent value="discounts" className="space-y-6 pt-6">
          {productsWithDiscount.length === 0 ? (
            <div className="text-center text-muted-foreground">
              {language === "ar" ? "لا توجد منتجات مخفضة حالياً" : "No discounted products at the moment"}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {productsWithDiscount.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  language={language}
                  onAddToCart={handleAddToCart}
                  ontoggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="coupons" className="space-y-6 pt-6">
          {coupons.length === 0 ? (
            <div className="text-center text-muted-foreground">
              {language === "ar" ? "لا توجد كوبونات متاحة حالياً" : "No coupons available right now"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map((coupon) => (
                <Card key={coupon._id} className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Percent className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {coupon.validUntil && (
                          language === "ar"
                            ? `صالح حتى: ${formatDate(new Date(coupon.validUntil))}`
                            : `Valid until: ${formatDate(new Date(coupon.validUntil))}`
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold text-xl mb-2">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}% ${language === "ar" ? "خصم" : "Off"}`
                        : `${coupon.discountValue.toLocaleString()} ${language === "ar" ? "ج.م" : "EGP"}`}
                    </h3>

                    <p className="text-muted-foreground mb-4">
                      {language === "ar"
                        ? `استخدم الكود ${coupon.code} للحصول على خصم`
                        : `Use code ${coupon.code} to claim the discount`}
                    </p>

                    <div className="flex items-center justify-between border border-dashed border-primary/50 rounded-md p-3 bg-primary/5 mb-4">
                      <code className="font-mono font-bold text-primary text-lg">{coupon.code}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={() => copyToClipboard(coupon.code)}
                      >
                        {copiedCode === coupon.code ? (
                          <>
                            <Check className="h-4 w-4" />
                            {language === "ar" ? "تم النسخ" : "Copied"}
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            {language === "ar" ? "نسخ الكود" : "Copy Code"}
                          </>
                        )}
                      </Button>
                    </div>

                    {coupon.minPurchaseAmount && (
                      <p className="text-xs text-muted-foreground">
                        {language === "ar"
                          ? `الحد الأدنى للطلب: ${coupon.minPurchaseAmount} ج.م`
                          : `Min order: ${coupon.minPurchaseAmount} EGP`}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="bg-muted/50 p-4 border-t">
                    <div className="w-full flex items-center justify-between">
                      <span className="text-sm">
                        {language === "ar"
                          ? coupon.isActive ? "الكوبون نشط" : "الكوبون غير نشط"
                          : coupon.isActive ? "Coupon active" : "Coupon inactive"}
                      </span>
                      <Button asChild size="sm">
                        <Link href="/products">{language === "ar" ? "تسوق الآن" : "Shop Now"}</Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
