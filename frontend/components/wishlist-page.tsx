"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingCart, Heart, Star, Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { wishlistService, cartService } from "@/lib/api"
import { MirvoryPageLoader } from "./MirvoryLoader"
import { ProductCard } from "./ProductCard"

// Wishlist item interface
interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    titleEn?: string;
    price: number;
    discountedPrice?: number;
    discountPercentage?: number;
    images: string[];
    category?: {
      name: string;
      nameEn: string;
    };
    brand?: string;
    quantity: number;
    ratings?: {
      average: number;
      count: number;
    };
    sizes?: string[];
    colors?: Array<{
      name: string;
      value: string;
      available: boolean;
    }>;
    sold?: number;
    isFeatured?: boolean;
    isFavorite?: boolean;
    status?: string;
  };
  dateAdded: Date;
}

export function WishlistPage() {
  const { language } = useLanguage()
  const isArabic = language === "ar"
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [sortOption, setSortOption] = useState("dateAdded")
  const [filterOption, setFilterOption] = useState("all")
  const [loading, setLoading] = useState(true)
  const [isClearing, setIsClearing] = useState(false)
  const [removingItems, setRemovingItems] = useState<string[]>([])
  const { toast } = useToast()

  // Fetch wishlist from API
  const fetchWishlist = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true)
      }
      const response = await wishlistService.getWishlist();
      //console.log(response.data, 'wishlist ')
      const wishlistData = response.data.data

      if (wishlistData?.products) {
        setWishlistItems(wishlistData.products)
      } else {
        setWishlistItems([])
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      toast({
        variant: "destructive",
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل في جلب قائمة المفضلة" : "Failed to load wishlist",
      })
      setWishlistItems([])
    } finally {
      if (showLoader) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  // Remove item from wishlist
  const removeFromWishlist = async (productId: string) => {
    try {
      setRemovingItems(prev => [...prev, productId])
      await wishlistService.toggleWishlist(productId)

      setWishlistItems(prev => prev.filter(item => item.product._id !== productId))
      setSelectedItems(prev => prev.filter(id => id !== productId))

      toast({
        title: language === "ar" ? "تم الحذف" : "Removed",
        description: language === "ar" ? "تم إزالة المنتج من المفضلة" : "Product removed from wishlist",
      })
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast({
        variant: "destructive",
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل في إزالة المنتج" : "Failed to remove product",
      })
    } finally {
      setRemovingItems(prev => prev.filter(id => id !== productId))
    }
  }

  // Clear entire wishlist
  const clearWishlist = async () => {
    try {
      setIsClearing(true);
      await wishlistService.clearWishlist();
      await fetchWishlist(false);
      setSelectedItems([]);
      toast({
        title: language === "ar" ? "تم مسح المفضلة" : "Cleared",
        description: language === "ar" ? "تم مسح قائمة المفضلة بالكامل" : "Wishlist cleared successfully",
      });
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast({
        variant: "destructive",
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل مسح قائمة المفضلة" : "Failed to clear wishlist",
      });
    } finally {
      setIsClearing(false);
    }
  };

  // Remove selected items
  const removeSelectedItems = async () => {
    try {
      setRemovingItems(selectedItems)

      for (const productId of selectedItems) {
        await wishlistService.toggleWishlist(productId)
      }

      setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item.product._id)))
      setSelectedItems([])

      toast({
        title: language === "ar" ? "تم الحذف" : "Removed",
        description: language === "ar"
          ? `تم إزالة ${selectedItems.length} منتجات من المفضلة`
          : `${selectedItems.length} products removed from wishlist`,
      })
    } catch (error) {
      console.error('Error removing selected items:', error)
      toast({
        variant: "destructive",
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل في إزالة المنتجات" : "Failed to remove products",
      })
    } finally {
      setRemovingItems([])
    }
  }

  // Select/deselect item
  const toggleSelectItem = (productId: string) => {
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // Select all items
  const selectAllItems = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map(item => item.product._id))
    }
  }

  // Add to cart handler
  const addToCartHandler = async (productId: string) => {
    try {
      await cartService.addToCart({ productId, quantity: 1 })
      toast({
        title: language === "ar" ? "تمت الإضافة" : "Added",
        description: language === "ar" ? "تمت إضافة المنتج إلى السلة" : "Product added to cart",
      })
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        variant: "destructive",
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل في إضافة المنتج إلى السلة" : "Failed to add product to cart",
      })
    }
  }

  // Add selected items to cart
  const addSelectedToCart = async () => {
    try {
      for (const productId of selectedItems) {
        await cartService.addToCart({ productId, quantity: 1 })
      }
      toast({
        title: language === "ar" ? "تمت الإضافة" : "Items added to cart",
        description: language === "ar"
          ? `تم إضافة ${selectedItems.length} منتجات إلى سلة التسوق`
          : `${selectedItems.length} items have been added to your cart`,
      })
    } catch (error) {
      console.error('Error adding selected items to cart:', error)
      toast({
        variant: "destructive",
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل في إضافة المنتجات إلى السلة" : "Failed to add items to cart",
      })
    }
  }

  // Filter items
  const filteredItems = wishlistItems.filter((item) => {
    if (filterOption === "all") return true
    if (filterOption === "inStock") return item.product.quantity > 0
    if (filterOption === "outOfStock") return item.product.quantity === 0
    if (filterOption === "withDiscount") return item.product.discountedPrice && item.product.discountedPrice < item.product.price
    return true
  })

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOption === "priceHighToLow") return b.product.price - a.product.price
    if (sortOption === "priceLowToHigh") return a.product.price - b.product.price
    if (sortOption === "dateAdded") return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    if (sortOption === "name") {
      const nameA = language === "ar" ? a.product.title : a.product.titleEn || a.product.title
      const nameB = language === "ar" ? b.product.title : b.product.titleEn || b.product.title
      return nameA.localeCompare(nameB)
    }
    return 0
  })

  if (loading) {
    return <MirvoryPageLoader text={language === "ar" ? "جاري التحميل..." : "Loading..."} />
  }

  return (
    <div className="space-y-8 py-6" dir={isArabic ? "rtl" : "ltr"}>
      <div className="space-y-6">
        <div className={`space-y-2 ${isArabic ? "text-right" : "text-left"}`}>
          <Badge variant="outline" className="px-3 py-1 w-fit">
            {isArabic ? "قائمتك الخاصة" : "Your curated list"}
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight">{isArabic ? "قائمة المفضلة" : "My Wishlist"}</h1>
          <p className="text-muted-foreground text-sm">
            {isArabic
              ? "احتفظ بكل المنتجات التي تحبها في مكان واحد وارجع إليها بسرعة."
              : "Keep every product you love in one place and revisit them quickly."}
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">
              {language === "ar" ? "قائمة المفضلة فارغة" : "Your wishlist is empty"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === "ar"
                ? "لم تقم بإضافة أي منتجات إلى المفضلة بعد. استعرض المنتجات وابدأ بإضافة منتجاتك المفضلة!"
                : "You haven't added any products to your wishlist yet. Browse products and start adding your favorites!"}
            </p>
            <Button asChild>
              <Link href="/products">{language === "ar" ? "تصفح المنتجات" : "Browse Products"}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between ${isArabic ? "text-right" : "text-left"}`}>
              <div className="flex flex-wrap gap-2">
                <Select value={filterOption} onValueChange={setFilterOption}>
                  <SelectTrigger className="h-9 w-[180px]">
                    <SelectValue placeholder={isArabic ? "تصفية" : "Filter"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isArabic ? "جميع المنتجات" : "All Items"}</SelectItem>
                    <SelectItem value="inStock">{isArabic ? "متوفر" : "In Stock"}</SelectItem>
                    <SelectItem value="outOfStock">{isArabic ? "غير متوفر" : "Out of Stock"}</SelectItem>
                    <SelectItem value="withDiscount">{isArabic ? "منتجات بخصم" : "With Discount"}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="h-9 w-[200px]">
                    <SelectValue placeholder={isArabic ? "ترتيب حسب" : "Sort by"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dateAdded">{isArabic ? "تاريخ الإضافة" : "Date Added"}</SelectItem>
                    <SelectItem value="priceHighToLow">{isArabic ? "السعر: الأعلى فالأقل" : "Price: High to Low"}</SelectItem>
                    <SelectItem value="priceLowToHigh">{isArabic ? "السعر: الأقل فالأعلى" : "Price: Low to High"}</SelectItem>
                    <SelectItem value="name">{isArabic ? "الاسم" : "Name"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={`flex flex-col gap-3 ${isArabic ? "items-end" : "items-start"}`}>
                {wishlistItems.length > 0 && (
                  <div className={`flex flex-wrap items-center gap-2 ${isArabic ? "flex-row-reverse" : ""}`}>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={clearWishlist}
                      disabled={isClearing}
                    >
                      {isClearing ? (
                        <Loader2 className={`${isArabic ? "ml-2" : "mr-2"} h-4 w-4 animate-spin`} />
                      ) : (
                        <Trash2 className={`${isArabic ? "ml-2" : "mr-2"} h-4 w-4`} />
                      )}
                      {isArabic ? "مسح المفضلة" : "Clear wishlist"}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {isArabic
                        ? "نصيحة: امسح القائمة بالكامل لبدء قائمة مفضلة جديدة بسرعة"
                        : "Tip: Clear your wishlist to start a fresh favorites list fast."}
                    </span>
                  </div>
                )}

                {selectedItems.length > 0 && (
                  <div className={`flex flex-wrap gap-2 ${isArabic ? "flex-row-reverse" : ""}`}>
                    <Button variant="outline" size="sm" onClick={addSelectedToCart}>
                      <ShoppingCart className={`${isArabic ? "ml-2" : "mr-2"} h-4 w-4`} />
                      {isArabic ? "إضافة المحدد للسلة" : "Add selected"}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={removeSelectedItems} disabled={removingItems.length > 0}>
                      {removingItems.length > 0 ? (
                        <Loader2 className={`${isArabic ? "ml-2" : "mr-2"} h-4 w-4 animate-spin`} />
                      ) : (
                        <Heart className={`${isArabic ? "ml-2" : "mr-2"} h-4 w-4 fill-white`} />
                      )}
                      {isArabic ? "حذف المحدد" : "Remove"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {selectedItems.length > 0 && (
              <div className="flex items-center gap-3 bg-muted/60 p-3 rounded-xl">
                <Checkbox
                  id="select-all"
                  checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                  onCheckedChange={selectAllItems}
                />
                <Label htmlFor="select-all" className="text-sm">
                  {isArabic
                    ? `تم تحديد ${selectedItems.length} من ${filteredItems.length}`
                    : `${selectedItems.length} of ${filteredItems.length} selected`}
                </Label>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedItems.map((item) => {
                const enhancedProduct = {
                  ...item.product,
                  isFavorite: true,
                  discountPercentage: item.product.discountPercentage || 0,
                  discountedPrice: item.product.discountedPrice || item.product.price,
                  sold: item.product.sold || 0,
                  isFeatured: item.product.isFeatured || false,
                  status: item.product.status || 'available'
                }

                const checkboxPosition = isArabic ? "top-2 right-2" : "top-2 left-2"

                return (
                  <div key={item._id} className="relative">
                    <div className={`absolute ${checkboxPosition} z-10`}>
                      <Checkbox
                        checked={selectedItems.includes(item.product._id)}
                        onCheckedChange={() => toggleSelectItem(item.product._id)}
                        className="h-5 w-5 bg-background/80"
                      />
                    </div>
                    <ProductCard
                      key={item._id}
                      product={enhancedProduct}
                      language={language}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty state for filtered results */}
        {wishlistItems.length > 0 && sortedItems.length === 0 && (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">
              {language === "ar" ? "لا توجد منتجات مطابقة" : "No matching products"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === "ar"
                ? "لا توجد منتجات تطابق معايير التصفية المحددة"
                : "There are no products matching your selected filters"}
            </p>
            <Button variant="outline" onClick={() => setFilterOption("all")}>
              {language === "ar" ? "عرض جميع المنتجات" : "Show all products"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}