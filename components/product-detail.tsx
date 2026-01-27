"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MirvoryPageLoader } from "./MirvoryLoader"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  ShoppingCart, Heart, Share2, Star, Truck,
  ShieldCheck, RotateCcw, Minus, Plus, AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { cartService, productService, ratingService, wishlistService } from "@/lib/api"
import RatingStars from "@/components/Rating/RatingStars"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthProvider"

// TypeScript interfaces
interface Product {
  _id: string
  title: string
  description: string
  price: number
  discountPercentage: number
  discountedPrice: number
  quantity: number
  sold: number
  images: string[]
  sizes: string[]
  colors: Array<{
    name: string
    value: string
    available: boolean
  }>
  ratings: {
    average: number
    count: number
    distribution: {
      1: number
      2: number
      3: number
      4: number
      5: number
    }
  }
  category: {
    _id: string
    name: string
    nameEn: string
  }
  isFeatured: boolean
  status: 'available' | 'pending' | 'sold'
  createdAt: string
  updatedAt: string
}

interface Review {
  id: string
  _id?: string
  rating: number
  comment?: string
  user?: {
    id?: string
    name: string | null
  }
  createdAt: string
}

interface RelatedProduct {
  _id: string
  title: string
  price: number
  discountPercentage: number
  discountedPrice: number
  images: string[]
  ratings: {
    average: number
    count: number
  }
}

const ProductDetail = ({ productId }: { productId: string }) => {
  const { language, t } = useLanguage()
  const { user } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mainImage, setMainImage] = useState('')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [ratingsSummary, setRatingsSummary] = useState<{ average: number, total: number } | null>(null)
  const [userRatingId, setUserRatingId] = useState<string | null>(null)
  const [ratingInput, setRatingInput] = useState(0)
  const [commentInput, setCommentInput] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)
  const userId = user?.id || null
  const reviewFormRef = useRef<HTMLFormElement | null>(null)

  const handleReload = useCallback(() => {
    setIsLoading(true)
    setProduct(null)
    setError(null)
  }, [productId])

  useEffect(() => {
    //console.log(user, 'im user ')
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await productService.getProductById(productId)
        //console.log('Product response:', response.data.product)

        if (response.data && response.data.product) {
          const productData = response.data.product
          setProduct(productData)
          setMainImage(productData.images?.[0] || '')
          // initialize selections to match current quantity
          setSelectedSizes(Array(Math.max(1, quantity)).fill(''))
          setSelectedColors(Array(Math.max(1, quantity)).fill(''))

          // Fetch related products after main product is loaded
          if (productData.category?._id) {
            fetchRelatedProducts(productData.category._id)
          }
        } else {
          const msg = language === 'ar' ? 'حدث خطأ أثناء تحميل المنتج' : 'Error loading product'
          setError(msg)
          toast.error(msg)
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        const msg = language === 'ar' ? 'حدث خطأ أثناء تحميل المنتج' : 'Error loading product'
        setError(msg)
        toast.error(msg)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchRelatedProducts = async (categoryId: string) => {
      try {
        const response = await productService.getProducts({
          category: categoryId,
          limit: 4,
          exclude: productId
        })

        if (response.data && response.data.products) {
          setRelatedProducts(response.data.products)
        }
      } catch (err) {
        console.error("Failed to fetch related products:", err)
        setRelatedProducts([])
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId, language, quantity])

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        // Check if product is in wishlist
        const response = await wishlistService.getWishlist();
        const wishlistItems = response.data?.items || response.data?.products || [];
        const isInWishlist = wishlistItems.some((item: any) =>
          item.product?._id === productId || item.product === productId
        );
        setIsFavorite(isInWishlist);
      } catch (err) {
        console.error("Failed to check favorite status:", err)
        setIsFavorite(false)
      }
    }

    if (productId && product) {
      checkFavorite()
    }
  }, [productId, product])

  const handleQuantityChange = useCallback((value: number) => {
    const maxQuantity = product?.quantity || 10
    const next = Math.max(1, Math.min(value, maxQuantity))
    setQuantity(next)
    setSelectedSizes(prev => {
      const arr = [...prev]
      if (arr.length > next) {
        return arr.slice(0, next)
      }
      while (arr.length < next) arr.push('')
      return arr
    })
    setSelectedColors(prev => {
      const arr = [...prev]
      if (arr.length > next) {
        return arr.slice(0, next)
      }
      while (arr.length < next) arr.push('')
      return arr
    })
  }, [product?.quantity])

  const setSizeAt = useCallback((index: number, value: string) => {
    setSelectedSizes(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }, [])

  const setColorAt = useCallback((index: number, value: string) => {
    setSelectedColors(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }, [])

  const addToCartHandler = useCallback(async () => {
    if (!product) return
    if (product?.sizes?.length > 0) {
      const validSizes = selectedSizes.length === quantity && selectedSizes.every(Boolean)
      if (!validSizes) {
        toast.error(language === 'ar' ? 'يرجى اختيار المقاسات لكل قطعة' : 'Please select sizes for all items')
        return
      }
    }
    if (product?.colors?.length > 0) {
      const validColors = selectedColors.length === quantity && selectedColors.every(Boolean)
      if (!validColors) {
        toast.error(language === 'ar' ? 'يرجى اختيار الألوان لكل قطعة' : 'Please select colors for all items')
        return
      }
    }

    try {
      const response = await cartService.addToCart({
        productId,
        quantity,
        sizes: selectedSizes,
        colors: selectedColors
      })
      //console.log(response, 'response')
      toast.success(language === 'ar' ? 'تم إضافة المنتج إلى السلة بنجاح' : 'Product added to cart successfully')
    } catch (err: any) {
      const msg = err?.response?.data?.message || (language === 'ar' ? 'فشل إضافة المنتج إلى السلة' : 'Failed to add product to cart')
      toast.error(msg)
    }
  }, [productId, quantity, selectedSizes, selectedColors, product, language])

  const toggleWishlist = useCallback(async () => {
    try {
      const response = await wishlistService.toggleWishlist(productId)
      const newFavoriteStatus = !isFavorite
      setIsFavorite(newFavoriteStatus)
      toast.success(newFavoriteStatus ?
        (language === 'ar' ? 'تمت الإضافة إلى المفضلة' : 'Added to favorites') :
        (language === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from favorites')
      )
    } catch (err) {
      toast.error(language === 'ar' ? 'فشل تحديث المفضلة' : 'Failed to update favorites')
    }
  }, [productId, isFavorite, language])

  const fetchRatings = useCallback(async () => {
    try {

      setIsLoadingReviews(true)
      const ratingResponse = await ratingService.getProductRatings(productId)
      //console.log('Fullratingresponse:', ratingResponse)

      // Handle the nested response structure
      const ratingData = ratingResponse?.data?.data || {}
      //console.log('Rating data:', ratingData)

      const reviewsData = ratingData.ratings || []
      //console.log('Reviews data:', reviewsData)

      setReviews(reviewsData)

      if (ratingData.averageRating !== undefined || ratingData.total !== undefined) {
        setRatingsSummary({
          average: ratingData.averageRating ?? 0,
          total: ratingData.total ?? 0
        })
      } else {
        setRatingsSummary(null)
      }

      //console.log('Processed reviews:', reviewsData)
    } catch (err) {
      console.error('Failed to load ratings', err)
      toast.error(language === 'ar' ? 'فشل تحميل التقييمات' : 'Failed to load reviews')
    } finally {
      setIsLoadingReviews(false)
    }
  }, [productId, language])
  useEffect(() => {
    if (productId) {
      fetchRatings()
    }
  }, [productId, fetchRatings])

  useEffect(() => {
    if (!userId) {
      setUserRatingId(null)
      setRatingInput(0)
      setCommentInput('')
      return
    }

    //console.log('Checking for user review. User ID:', userId)
    //console.log('All reviews:', reviews)

    const existingRating = reviews.find(review => {
      const reviewUserId = review.user?.id
      //console.log('Review user ID:', reviewUserId, 'Current user ID:', userId, 'Match:', reviewUserId === userId)
      return reviewUserId === userId
    })

    //console.log('Found existing rating:', existingRating)

    if (existingRating) {
      // Use the id field from your API response
      const ratingId = existingRating.id
      //console.log('Setting user rating ID:', ratingId)
      setUserRatingId(ratingId || null)
      setRatingInput(existingRating.rating)
      setCommentInput(existingRating.comment || '')
    } else {
      //console.log('No existing rating found for user')
      setUserRatingId(null)
      setRatingInput(0)
      setCommentInput('')
    }
  }, [userId, reviews])
  const handleEditReview = useCallback((review: Review) => {
    //console.log('Editing review:', review)

    // Use the id field from your API response
    const ratingId = review.id
    //console.log('Extracted rating ID:', ratingId)
    //console.log('Current user ID:', userId)

    if (!ratingId) {
      console.error('No rating ID found for review')
      toast.error(language === 'ar' ? 'تعذر العثور على التقييم' : 'Could not find review')
      return
    }

    setUserRatingId(ratingId)
    setRatingInput(review.rating)
    setCommentInput(review.comment || '')

    /*
    console.log('Form state updated:', {
      userRatingId: ratingId,
      rating: review.rating,
      comment: review.comment
    });
    */

    reviewFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    toast.info(language === 'ar' ? 'يمكنك الآن تعديل تقييمك' : 'You can now edit your review')
  }, [language, userId])

  const handleSubmitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) {
      toast.error(language === 'ar' ? 'يرجى تسجيل الدخول لتقييم المنتج' : 'Please log in to rate the product')
      return
    }
    if (!ratingInput) {
      toast.error(language === 'ar' ? 'يرجى اختيار تقييم' : 'Please select a rating')
      return
    }

    setIsSubmittingReview(true)
    try {
      const payload = {
        rating: ratingInput,
        comment: commentInput.trim() || undefined
      }

      //console.log('Submitting review. User rating ID:', userRatingId)

      if (userRatingId) {
        await ratingService.updateRating(productId, userRatingId, payload)
        toast.success(language === 'ar' ? 'تم تحديث تقييمك' : 'Review updated')
      } else {
        await ratingService.createRating(productId, payload)
        toast.success(language === 'ar' ? 'تم إضافة تقييمك' : 'Review submitted')
      }
      await fetchRatings()
    } catch (err: any) {
      console.error('Error submitting review:', err)
      const message = err?.response?.data?.message || (language === 'ar' ? 'فشل حفظ التقييم' : 'Failed to save review')
      toast.error(message)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleDeleteReview = useCallback(async (ratingId?: string) => {
    const targetRatingId = ratingId || userRatingId
    if (!targetRatingId) {
      toast.error(language === 'ar' ? 'لم يتم العثور على التقييم' : 'Review not found')
      return
    }

    // Confirmation dialog
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا التقييم؟' : 'Are you sure you want to delete this review?')) {
      return
    }

    setDeletingReviewId(targetRatingId)
    try {
      await ratingService.deleteRating(productId, targetRatingId)
      toast.success(language === 'ar' ? 'تم حذف التقييم' : 'Review deleted')

      // Reset form if deleting the current user's review
      if (targetRatingId === userRatingId) {
        setRatingInput(0)
        setCommentInput('')
        setUserRatingId(null)
      }

      await fetchRatings()
    } catch (err: any) {
      console.error('Error deleting review:', err)
      const message = err?.response?.data?.message || (language === 'ar' ? 'فشل حذف التقييم' : 'Failed to delete review')
      toast.error(message)
    } finally {
      setDeletingReviewId(null)
    }
  }, [userRatingId, productId, language, fetchRatings])

  if (isLoading) {
    return <MirvoryPageLoader text={language === "ar" ? "جاري التحميل..." : "Loading..."} />
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <p className="text-red-500 mb-4">
          {language === "ar" ? "لم يتم العثور على المنتج أو حدث خطأ" : "Product not found or an error occurred"}
        </p>
        <Button onClick={handleReload}>
          {language === "ar" ? "إعادة المحاولة" : "Try Again"}
        </Button>
      </div>
    )
  }

  const hasDiscount = product.discountPercentage > 0
  const finalPrice = hasDiscount ? product.discountedPrice : product.price
  const isOutOfStock = product.quantity === 0 || product.status === 'sold'
  const ratingAverageDisplay = ratingsSummary?.average ?? product.ratings?.average ?? 0
  const ratingCountDisplay = ratingsSummary?.total ?? product.ratings?.count ?? 0

  return (
    <div className="container mx-auto px-4 py-8" dir={language === "ar" ? "rtl" : "ltr"}>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              {language === "ar" ? "الرئيسية" : "Home"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">
              {language === "ar" ? "المنتجات" : "Products"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              {language === "ar" ? product.category?.name : product.category?.nameEn}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{product.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-100">
            {mainImage && (
              <Image
                src={mainImage}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setMainImage(image)}
                  className={`relative aspect-square rounded-md overflow-hidden ${mainImage === image ? 'ring-2 ring-primary' : 'border'
                    }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{product.title}</h1>
            <div className="flex items-center gap-2">
              <RatingStars rating={product.ratings?.average || 0} />
              <span className="text-sm text-muted-foreground">
                ({product?.ratings?.count || 0} {language === "ar" ? "تقييم" : "reviews"})
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{finalPrice.toLocaleString()} {language === "ar" ? "ج.م" : "EGP"}</span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {product.price.toLocaleString()} {language === "ar" ? "ج.م" : "EGP"}
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    {product.discountPercentage}% {language === "ar" ? "خصم" : "off"}
                  </Badge>
                </>
              )}
            </div>
            {!isOutOfStock ? (
              <span className="text-sm text-green-500">
                {language === "ar" ? `متوفر (${product.quantity} قطعة)` : `Available (${product.quantity} items)`}
              </span>
            ) : (
              <span className="text-sm text-red-500">
                {language === "ar" ? "نفد من المخزون" : "Out of stock"}
              </span>
            )}
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          {product.sizes?.length > 0 && (
            <div className="space-y-2">
              <Label>{language === "ar" ? "اختَر المقاسات لكل قطعة" : "Select sizes per item"}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Array.from({ length: quantity }).map((_, idx) => (
                  <div key={`size-slot-${idx}`} className="flex items-center gap-2">
                    <Label className="w-16 text-sm">{language === "ar" ? `قطعة ${idx + 1}` : `Item ${idx + 1}`}</Label>
                    <Select value={selectedSizes[idx] || ''} onValueChange={(v) => setSizeAt(idx, v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={language === "ar" ? "اختر المقاس" : "Choose size"} />
                      </SelectTrigger>
                      <SelectContent>
                        {product.sizes.map((size) => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product?.colors?.length > 0 && (
            <div className="space-y-2">
              <Label>{language === "ar" ? "اختَر الألوان لكل قطعة" : "Select colors per item"}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Array.from({ length: quantity }).map((_, idx) => (
                  <div key={`color-slot-${idx}`} className="flex items-center gap-2">
                    <Label className="w-16 text-sm">{language === "ar" ? `قطعة ${idx + 1}` : `Item ${idx + 1}`}</Label>
                    <Select value={selectedColors[idx] || ''} onValueChange={(v) => setColorAt(idx, v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={language === "ar" ? "اختر اللون" : "Choose color"} />
                      </SelectTrigger>
                      <SelectContent>
                        {product.colors.filter(c => c.available).map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <span className="inline-block h-4 w-4 rounded-full border" style={{ backgroundColor: color.value }} />
                              <span>{color.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-4">
            <Label>{language === "ar" ? "الكمية" : "Quantity"}</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                className="w-16 text-center"
                value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                type="number"
                min="1"
                max={product.quantity}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4">
            <Button
              className="flex-1"
              onClick={addToCartHandler}
              disabled={isOutOfStock}
              size="lg"
            >
              <ShoppingCart className="ml-2 h-4 w-4" />
              {language === "ar" ? "أضف إلى السلة" : "Add to Cart"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleWishlist}
              disabled={isOutOfStock}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'text-red-500 fill-red-500' : ''}`} />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{language === "ar" ? "شحن مجاني" : "Free Shipping"}</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{language === "ar" ? "إرجاع سهل" : "Easy Returns"}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{language === "ar" ? "ضمان 2 سنة" : "2-Year Warranty"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description" className={language === "ar" ? "dir-rtl" : "dir-ltr"}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">
              {language === "ar" ? "الوصف" : "Description"}
            </TabsTrigger>
            <TabsTrigger value="specifications">
              {language === "ar" ? "المواصفات" : "Specifications"}
            </TabsTrigger>
            <TabsTrigger value="reviews">
              {language === "ar" ? "التقييمات" : "Reviews"}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description">
            <div className="p-4">
              <p>{product.description}</p>
            </div>
          </TabsContent>
          <TabsContent value="specifications">
            <div className="p-4">
              <div className="space-y-2">
                <div className="flex border-b py-2">
                  <span className="font-medium w-1/3">{language === "ar" ? "الفئة" : "Category"}</span>
                  <span className="text-muted-foreground">
                    {language === "ar" ? product.category?.name : product.category?.nameEn}
                  </span>
                </div>
                <div className="flex border-b py-2">
                  <span className="font-medium w-1/3">{language === "ar" ? "الحالة" : "Status"}</span>
                  <span className="text-muted-foreground">
                    {product.status === 'available'
                      ? (language === "ar" ? "متاح" : "Available")
                      : (language === "ar" ? "مباع" : "Sold")
                    }
                  </span>
                </div>
                <div className="flex border-b py-2">
                  <span className="font-medium w-1/3">{language === "ar" ? "الكمية المباعة" : "Sold"}</span>
                  <span className="text-muted-foreground">{product.sold}</span>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews">
            <div className="p-4 space-y-8">
              <div className="grid gap-4 md:grid-cols-[1fr_1.5fr]">
                <Card className="bg-muted/40">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? "متوسط التقييم" : "Average rating"}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-bold">
                          {(ratingsSummary?.average || product.ratings?.average || 0).toFixed(1)}
                        </span>
                        <RatingStars
                          rating={ratingsSummary?.average || product.ratings?.average || 0}
                          size={20}
                          showEmptyStars
                          className="text-yellow-400"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar"
                        ? `${ratingsSummary?.total || product.ratings?.count || 0} تقييم`
                        : `${ratingsSummary?.total || product.ratings?.count || 0} reviews`
                      }
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <form ref={reviewFormRef} id="review-form-section" className="space-y-4" onSubmit={handleSubmitReview}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">
                          {userRatingId
                            ? (language === "ar" ? "تعديل تقييمك" : "Update your review")
                            : (language === "ar" ? "أضف تقييمك" : "Add your review")}
                        </h3>
                        {userRatingId && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleDeleteReview}
                            disabled={!!deletingReviewId}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            {deletingReviewId
                              ? (language === "ar" ? "جاري الحذف..." : "Deleting...")
                              : (language === "ar" ? "حذف التقييم" : "Delete review")
                            }
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>{language === "ar" ? "تقييمك" : "Your rating"}</Label>
                        <RatingStars
                          rating={ratingInput}
                          interactive
                          onChange={(value) => setRatingInput(value)}
                          size={32}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="review-comment">
                          {language === "ar" ? "تعليقك" : "Your comment"}
                        </Label>
                        <Textarea
                          id="review-comment"
                          placeholder={language === "ar" ? "شارك تجربتك" : "Share your experience"}
                          value={commentInput}
                          onChange={(event) => setCommentInput(event.target.value)}
                          rows={4}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmittingReview || isLoadingReviews}
                        className="w-full"
                      >
                        {isSubmittingReview
                          ? (language === "ar" ? "جاري الحفظ..." : "Saving...")
                          : userRatingId
                            ? (language === "ar" ? "تحديث التقييم" : "Update review")
                            : (language === "ar" ? "إرسال التقييم" : "Submit review")}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {language === "ar" ? "آراء العملاء" : "Customer reviews"}
                </h3>
                {isLoadingReviews ? (
                  <p className="text-muted-foreground">
                    {language === "ar" ? "جاري تحميل التقييمات..." : "Loading reviews..."}
                  </p>
                ) : reviews.length === 0 ? (
                  <p className="text-muted-foreground">
                    {language === "ar" ? "لا توجد تقييمات بعد" : "No reviews yet"}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => {
                      const reviewUserId = review.user?.id
                      const isUserReview = userId && reviewUserId === userId
                      const ratingId = review.id
                      const isDeletingThisReview = deletingReviewId === ratingId

                      return (
                        <Card key={ratingId} className="border">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">
                                  {review.user?.name || (language === 'ar' ? 'مستخدم' : 'Customer')}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {isUserReview && (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditReview(review)}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      {language === 'ar' ? 'تعديل' : 'Edit'}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                      onClick={() => handleDeleteReview(ratingId)}
                                      disabled={isDeletingThisReview}
                                    >
                                      {isDeletingThisReview
                                        ? (language === 'ar' ? 'جاري الحذف...' : 'Deleting...')
                                        : (language === 'ar' ? 'حذف' : 'Delete')}
                                    </Button>
                                  </div>
                                )}
                                <RatingStars rating={review.rating} size={20} showEmptyStars readOnly />
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-muted-foreground">
                                {review.comment}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs> {/* Added missing closing Tabs tag */}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">
            {language === "ar" ? "منتجات ذات صلة" : "Related Products"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct._id} className="overflow-hidden">
                <CardContent className="p-0">
                  <Link href={`/products/${relatedProduct._id}`} className="block">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={relatedProduct.images?.[0] || '/placeholder.svg'}
                        alt={relatedProduct.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-sm mb-2 line-clamp-2">{relatedProduct.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">
                            {relatedProduct.discountedPrice.toLocaleString()} {language === "ar" ? "ج.م" : "EGP"}
                          </span>
                          {relatedProduct.discountPercentage > 0 && (
                            <span className="text-xs text-muted-foreground line-through">
                              {relatedProduct.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {relatedProduct.discountPercentage > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {relatedProduct.discountPercentage}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail