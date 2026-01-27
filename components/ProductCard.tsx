"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Star, Package } from "lucide-react"
import { toast } from 'sonner';
import { cartService, wishlistService } from "@/lib/api"
import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl"

type ProductColorOption = {
  name: string
  value: string
  available: boolean
}

type ProductRatings = {
  average: number
  count: number
}

type ProductCardProduct = {
  _id: string
  title: string
  images: string[]
  price: number
  discountPercentage?: number
  discountedPrice?: number
  quantity: number
  sizes?: string[]
  colors?: ProductColorOption[]
  category?: {
    name?: string
    nameEn?: string
  }
  ratings?: ProductRatings
  sold?: number
  isFeatured?: boolean
  sellerTrusted?: boolean
  isFavorite?: boolean
}

interface ProductCardProps {
  product: ProductCardProduct
  language: string
  onAddToCart?: (productId: string) => void
  onToggleWishlist?: (productId: string) => Promise<void> | void
  isFavorite?: boolean
}

export function ProductCard({ product, language, onAddToCart, onToggleWishlist, isFavorite: isFavoriteProp }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  const computedDiscountedPrice = useMemo(() => {
    if (product.discountedPrice && product.discountedPrice > 0) {
      return product.discountedPrice
    }
    if (product.discountPercentage && product.discountPercentage > 0) {
      const discountAmount = product.price * (product.discountPercentage / 100)
      return Number((product.price - discountAmount).toFixed(2))
    }
    return product.price
  }, [product.discountedPrice, product.discountPercentage, product.price])

  const hasDiscount = computedDiscountedPrice < product.price
  const isLowStock = product.quantity > 0 && product.quantity <= 5
  const isOutOfStock = product.quantity === 0
  const sizes = product.sizes ?? []
  const colors = product.colors ?? []
  const hasSizes = sizes.length > 0
  const hasColors = colors.length > 0
  const availableColors = colors.filter((color: ProductColorOption) => color.available)

  useEffect(() => {
    if (typeof isFavoriteProp === "boolean") {
      setIsFavorite(isFavoriteProp)
    } else {
      setIsFavorite(product.isFavorite || false)
    }
  }, [isFavoriteProp, product.isFavorite])


  // Toggle Favorite Handler - للزر العلوي (إضافة/إزالة)
  const toggleWishlistHandler = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (onToggleWishlist) {
      setIsTogglingFavorite(true)
      try {
        await onToggleWishlist(product._id)
      } finally {
        setIsTogglingFavorite(false)
      }
      return
    }

    setIsTogglingFavorite(true)
    try {
      await wishlistService.toggleWishlist(product._id)

      const newFavoriteStatus = !isFavorite
      setIsFavorite(newFavoriteStatus)

      toast.success(
        newFavoriteStatus
          ? (language === "ar" ? "تمت الإضافة إلى المفضلة" : "Added to favorites")
          : (language === "ar" ? "تم الحذف من المفضلة" : "Removed from favorites")
      )
    } catch (error) {
      console.error('Toggle favorite error:', error)
      toast.error(language === "ar" ? "فشل تحديث المفضلة" : "Failed to update favorites")
    } finally {
      setIsTogglingFavorite(false)
    }
  }, [onToggleWishlist, product._id, isFavorite, language])

  const addToCartHandler = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock) {
      toast.error(language === "ar" ? "المنتج غير متوفر" : "Product is out of stock")
      return
    }

    // Check if product requires size selection
    if (hasSizes && !selectedSize) {
      toast.error(language === "ar" ? "يرجى اختيار المقاس أولاً" : "Please select a size first")
      return
    }

    // Check if product requires color selection
    if (hasColors && !selectedColor) {
      toast.error(language === "ar" ? "يرجى اختيار اللون أولاً" : "Please select a color first")
      return
    }

    setIsAddingToCart(true)
    try {
      await cartService.addToCart({
        productId: product._id,
        quantity: 1,
        sizes: selectedSize ? [selectedSize] : undefined,
        colors: selectedColor ? [selectedColor] : undefined
      })

      toast.success(language === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart")
    } catch (error) {
      console.error('Add to cart error:', error)
      toast.error(language === "ar" ? "فشل إضافة المنتج إلى السلة" : "Failed to add product to cart")
    } finally {
      setIsAddingToCart(false)
    }
  }, [product._id, isOutOfStock, hasSizes, hasColors, selectedSize, selectedColor, language])




  return (
    <Link href={`/products/${product._id}`} className="block" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-200 hover:shadow-md">
        {/* Product Image */}
        <div className="aspect-square relative">
          <Image
            src={normalizeImageUrl(product.images[0])}
            alt={product.title}
            fill
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = "/placeholder.svg";
            }}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badges and Wishlist Button */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{product.discountPercentage}%
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                {language === "ar" ? "مميز" : "Featured"}
              </span>
            )}
            {product.sellerTrusted && (
              <div className="relative inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold pl-3 pr-4 py-2 rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>{language === "ar" ? "منتج موثوق" : "Trusted Product"}</span>
              </div>
            )}
            {isOutOfStock && (
              <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
                {language === "ar" ? "نفذت الكمية" : "Out of Stock"}
              </span>
            )}
          </div>

          {/* Wishlist Button - Top Right */}
          <button
            className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${isFavorite
              ? 'bg-red-500 text-white opacity-100 scale-110'
              : 'bg-white/90 opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110'
              }`}
            onClick={toggleWishlistHandler}
            disabled={isTogglingFavorite}
            title={isFavorite ?
              (language === "ar" ? "إزالة من المفضلة" : "Remove from favorites") :
              (language === "ar" ? "إضافة إلى المفضلة" : "Add to favorites")
            }
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-white' : 'text-gray-700'}`} />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-3">
          {/* Category */}
          <p className="text-xs text-gray-500 mb-1">
            {language === "ar" ? product.category?.name : product.category?.nameEn}
          </p>

          {/* Title */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">
            {product.title}
          </h3>

          {/* Rating & Sold */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-xs text-gray-600">
                {product?.ratings?.average?.toFixed(2) ?? "0.0"}
              </span>
              <span className="ml-0.5 text-xs text-gray-400">
                ({product?.ratings?.count})
              </span>
            </div>
            {(product.sold ?? 0) > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <Package className="h-3.5 w-3.5 mr-1" />
                {product.sold ?? 0} {language === "ar" ? "مباع" : "sold"}
              </div>
            )}
          </div>

          {/* Size Selection */}
          {hasSizes && (
            <div className="mb-2">
              <p className="text-xs text-gray-600 mb-1">
                {language === "ar" ? "المقاس:" : "Size:"}
              </p>
              <div className="flex gap-1 flex-wrap">
                {sizes.slice(0, 4).map((size: string, idx: number) => (
                  <button
                    key={idx}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${selectedSize === size
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedSize(size)
                    }}
                  >
                    {size}
                  </button>
                ))}
                {sizes.length > 4 && (
                  <span className="text-xs px-1.5 py-0.5 text-gray-500">
                    +{sizes.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {hasColors && (
            <div className="mb-2">
              <p className="text-xs text-gray-600 mb-1">
                {language === "ar" ? "اللون:" : "Color:"}
              </p>
              <div className="flex gap-2 flex-wrap">
                {availableColors.slice(0, 6).map((color: ProductColorOption, idx: number) => (
                  <button
                    key={idx}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${selectedColor === color.value
                      ? 'border-blue-500 scale-110'
                      : 'border-gray-300 hover:scale-105'
                      }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedColor(color.value)
                    }}
                  />
                ))}
                {availableColors.length > 6 && (
                  <span className="text-xs px-1.5 py-0.5 text-gray-500">
                    +{availableColors.length - 6}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            {hasDiscount ? (
              <>
                <span className="text-base font-bold text-blue-600">
                  {computedDiscountedPrice.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-blue-600">
                {product.price.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
              </span>
            )}
          </div>

          {/* Stock Warning */}
          {isLowStock && (
            <p className="text-xs text-orange-600 font-medium">
              {language === "ar" ? `${product.quantity} متبقي فقط` : `Only ${product.quantity} left`}
            </p>
          )}

          {/* Buttons Container */}
          <div className="flex gap-2 mt-2">
            {/* Add to Cart Button */}
            <Button
              className="flex-1"
              size="sm"
              disabled={isOutOfStock || isAddingToCart}
              onClick={addToCartHandler}
            >
              {isAddingToCart ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  {language === "ar" ? "جاري الإضافة..." : "Adding..."}
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {isOutOfStock
                    ? (language === "ar" ? "نفذت الكمية" : "Out of Stock")
                    : (language === "ar" ? "أضف للسلة" : "Add to Cart")
                  }
                </>
              )}
            </Button>

            {/* Wishlist Button - Bottom */}
            <Button
              variant="outline"
              size="sm"
              className="px-3"
              onClick={toggleWishlistHandler}
              disabled={isTogglingFavorite}
              title={isFavorite ?
                (language === "ar" ? "إزالة من المفضلة" : "Remove from favorites") :
                (language === "ar" ? "إضافة إلى المفضلة" : "Add to favorites")
              }
            >
              {isTogglingFavorite ? (
                <div className="h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}