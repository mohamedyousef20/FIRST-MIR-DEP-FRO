"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Trash,
  ShoppingCart,
  Minus,
  Plus,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowRight,
  Tag,
  CheckCircle2,
  AlertCircle,
  Package,
  Gift,
  Star,
  ChevronLeft,
  Sparkles
} from "lucide-react"
import { cartService, couponService } from "@/lib/api"
import { MirvoryPageLoader } from "./MirvoryLoader"

interface CartItem {
  _id: string
  productId: string
  name: string
  nameEn: string
  image: string
  quantity: number
  price: number
  oldPrice?: number
  color?: string
  colorEn?: string
  size?: string
  maxQuantity: number
}

interface CouponResponse {
  valid: boolean
  coupon: {
    code: string
    discountType: string
    discountValue: number
    minCartValue: number
    maxDiscount?: number
  }
  originalTotal: number
  discountedTotal: number
  discountAmount: number
  message: string
}

interface CartData {
  _id: string
  user: string
  appliedCoupon?: {
    code: string
    discountAmount: number
    discountedTotal: number
    originalTotal: number
    appliedAt: string
  }
  items: CartItem[]
  total: number
  itemCount: number
}

export function CartPage() {
  const { language, t } = useLanguage()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponData, setCouponData] = useState<CouponResponse | null>(null)
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)
  const [freeShippingProgress, setFreeShippingProgress] = useState(0)

  // Ref for debouncing
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const mapCartItemsFromResponse = (cart: any): CartItem[] => {
    try {
      const items = Array.isArray(cart?.items) ? cart.items : [];

      return items.map((item: any) => {
        const product = item.product || {};

        return {
          _id: item._id || '',
          productId: product._id || '',
          name: product.title || '',
          nameEn: product.titleEn || product.title || '',
          image: Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : "/placeholder.svg",
          quantity: typeof item.quantity === 'number' ? item.quantity : 1,
          price: typeof item.price === 'number'
            ? item.price
            : (typeof product.price === 'number' ? product.price : 0),
          oldPrice: undefined,
          color: Array.isArray(item.colors) && item.colors.length > 0
            ? item.colors[0]
            : undefined,
          colorEn: Array.isArray(item.colors) && item.colors.length > 0
            ? item.colors[0]
            : undefined,
          size: Array.isArray(item.sizes) && item.sizes.length > 0
            ? item.sizes[0]
            : undefined,
          maxQuantity: product.quantity || product.stock || 10
        };
      });
    } catch (error) {
      console.error('Error mapping cart items:', error);
      return [];
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await cartService.getCart();

      if (response.data) {
        const items = mapCartItemsFromResponse(response.data)
        setCartItems(items)
        setCartData(response.data);

        if (response.data.appliedCoupon && response.data.appliedCoupon.code) {
          setCouponApplied(true);
          setCouponCode(response.data.appliedCoupon.code);

          const couponData: CouponResponse = {
            valid: true,
            coupon: {
              code: response.data.appliedCoupon.code,
              discountType: 'fixed',
              discountValue: response.data.appliedCoupon.discountAmount,
              minCartValue: 0,
              maxDiscount: undefined
            },
            originalTotal: response.data.appliedCoupon.originalTotal,
            discountedTotal: response.data.appliedCoupon.discountedTotal,
            discountAmount: response.data.appliedCoupon.discountAmount,
            message: "Coupon applied to cart"
          };
          setCouponData(couponData);
        } else {
          setCouponApplied(false);
          setCouponCode("");
          setCouponData(null);
        }
      } else {
        setCartItems([]);
        setCartData(null);
        setCouponApplied(false);
        setCouponCode("");
        setCouponData(null);
      }
    } catch (err: any) {
      console.error('Cart fetch error:', err)
      if (err.response?.status === 401) {
        setError(language === "ar" ? "يرجى تسجيل الدخول لعرض السلة" : 'Please login to view your cart')
      } else if (err.response?.status === 404) {
        setCartItems([]);
        setCartData(null);
        setCouponApplied(false);
        setCouponCode("");
        setCouponData(null);
        setError(null);
      } else {
        setError(err.response?.data?.message || (language === "ar" ? 'فشل في تحميل السلة' : 'Failed to load cart'))
      }
      setCartItems([]);
      setCartData(null);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const progress = Math.min(100, (subtotal / 500) * 100)
    setFreeShippingProgress(progress)
  }, [cartItems])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError(language === "ar" ? "يرجى إدخال كود الخصم" : "Please enter a coupon code")
      return
    }

    try {
      setCouponLoading(true)
      setCouponError(null)

      const subtotal = cartItems.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0)
      const applyResponse = await couponService.validateCoupon(couponCode.trim(), subtotal)

      if (applyResponse.status === 200) {
        setCouponApplied(true);
        setCouponData(applyResponse.data);
        setCouponError(null);
        await fetchCart();
      } else {
        setCouponApplied(false);
        setCouponData(null);
        setCouponError(applyResponse.data.message || 'Invalid coupon code');
      }
    } catch (err: any) {
      console.error('Coupon application error:', err);
      setCouponApplied(false);
      setCouponData(null);
      setCouponError(
        err.response?.data?.message ||
        (language === "ar" ? "فشل في تطبيق كود الخصم" : "Failed to apply coupon code")
      );
    } finally {
      setCouponLoading(false);
    }
  }

  const handleRemoveCoupon = async () => {
    try {
      setCouponLoading(true)
      const response = await couponService.removeCouponFromCart()

      if (response.status === 200) {
        setCouponApplied(false)
        setCouponCode("")
        setCouponData(null)
        setCouponError(null)
        await fetchCart()
      } else {
        throw new Error(response.data?.message || 'Failed to remove coupon')
      }
    } catch (err: any) {
      console.error('Coupon removal error:', err)
      setCouponError(
        err.response?.data?.message || err.message ||
        (language === "ar" ? "فشل في إزالة كود الخصم" : "Failed to remove coupon code")
      )
    } finally {
      setCouponLoading(false)
    }
  }

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const item = cartItems.find(item => item._id === itemId);
    if (!item) return;

    if (newQuantity > item.maxQuantity) {
      setError(
        language === "ar"
          ? `الكمية المتاحة فقط ${item.maxQuantity} قطعة`
          : `Only ${item.maxQuantity} items available in stock`
      );
      return;
    }

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }

    const previousItems = [...cartItems];
    setCartItems(prev => prev.map(item =>
      item._id === itemId ? { ...item, quantity: newQuantity } : item
    ));

    setUpdatingItemId(itemId);

    try {
      const response = await cartService.updateCartItem(itemId, newQuantity);
      if (response.status === 200) {
        const updatedCart = response.data?.data || response.data;
        const updatedItems = mapCartItemsFromResponse(updatedCart);
        setCartItems(updatedItems);
        setCartData(updatedCart);

        if (updatedCart.appliedCoupon && updatedCart.appliedCoupon.code) {
          setCouponApplied(true);
          setCouponCode(updatedCart.appliedCoupon.code);
          setCouponData({
            valid: true,
            coupon: {
              code: updatedCart.appliedCoupon.code,
              discountType: 'fixed',
              discountValue: updatedCart.appliedCoupon.discountAmount,
              minCartValue: 0,
              maxDiscount: undefined
            },
            originalTotal: updatedCart.appliedCoupon.originalTotal,
            discountedTotal: updatedCart.appliedCoupon.discountedTotal,
            discountAmount: updatedCart.appliedCoupon.discountAmount,
            message: "Coupon applied"
          });
        } else {
          if (couponApplied) {
            setCouponApplied(false);
            setCouponCode("");
            setCouponData(null);
          }
        }
      } else {
        throw new Error('Failed to update quantity');
      }
    } catch (err: any) {
      console.error('Update error:', err);
      setCartItems(previousItems);
      if (err.name === 'AbortError') {
        setError(language === "ar" ? "انتهت مهلة الطلب، يرجى المحاولة مرة أخرى" : "Request timeout, please try again");
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          (language === "ar" ? "فشل تحديث الكمية" : "Failed to update quantity")
        );
      }
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const previousItems = [...cartItems]
    setCartItems(cartItems.filter(item => item._id !== itemId))

    try {
      setLoading(true)
      await cartService.removeFromCart(itemId)
      await fetchCart();
    } catch (err: any) {
      setCartItems(previousItems)
      setError(err.message || (language === "ar" ? 'فشل في إزالة المنتج' : 'Failed to remove item'))
    } finally {
      setLoading(false)
    }
  }

  const handleClearCart = async () => {
    try {
      setLoading(true)
      await cartService.clearCart()
      setCartItems([])
      setCartData(null)
      setCouponApplied(false)
      setCouponCode("")
      setCouponData(null)
      setCouponError(null)
    } catch (err: any) {
      setError(err.message || (language === "ar" ? 'فشل في إفراغ السلة' : 'Failed to clear cart'))
    } finally {
      setLoading(false)
    }
  }

  const subtotal = (cartItems || []).reduce((sum: number, item: CartItem) => {
    if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
      return sum;
    }
    return sum + (item.price * item.quantity);
  }, 0)

  const shipping = subtotal > 500 ? 0 : 30
  const total = cartData?.total !== undefined
    ? cartData.total + shipping
    : subtotal + shipping;
  // Green theme colors: #10b981 (blue-500)
  // Red theme colors: #ef4444 (red-500)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{t("cart")}</h1>
              <p className="text-blue-100 text-sm md:text-base">
                {language === "ar"
                  ? `${cartItems.length} منتج في سلة التسوق`
                  : `${cartItems.length} items in cart`}
              </p>
            </div>
            <div className="relative">
              <ShoppingCart className="h-10 w-10 md:h-12 md:w-12 opacity-90" />
              {cartItems.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 h-6 w-6 flex items-center justify-center p-0">
                  {cartItems.length}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Free Shipping Progress Bar */}
      {cartItems.length > 0 && shipping > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  {language === "ar" ? "احصل على شحن مجاني!" : "Get Free Shipping!"}
                </span>
              </div>
              <span className="text-xs text-amber-700">
                {Math.max(0, 500 - subtotal)} {language === "ar" ? "ج.م متبقية" : "EGP to go"}
              </span>
            </div>
            <Progress
              value={freeShippingProgress}
              className="h-2 bg-amber-100 [&_*]:bg-gradient-to-r [&_*]:from-blue-500 [&_*]:to-blue-600"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {loading && cartItems.length === 0 ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <MirvoryPageLoader text={language === "ar" ? "جاري التحميل..." : "Loading..."} />
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 text-lg mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {(t as any)("retry")}
            </Button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full"></div>
              <ShoppingCart className="h-20 w-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-800">{t("emptyCart")}</h2>
            <p className="text-gray-600 mb-8 text-sm md:text-base">
              {language === "ar"
                ? "ابدأ رحلة تسوق جديدة واكتشف منتجاتنا المميزة"
                : "Start a new shopping journey and discover our exclusive products"}
            </p>
            <Button
              asChild
              size="lg"
                  className="bg-gradient-to-r from-blue-500 to-emerald-600 hover:from-blue-600 hover:to-blue-700 gap-2"
            >
              <Link href="/products">
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                {t("continueShopping")}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items - Left Column */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-blue-100">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="relative h-40 w-full sm:h-32 sm:w-32 md:h-40 md:w-40 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={language === "ar" ? item.name : item.nameEn}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                        {/* Stock Badge */}
                        {item.quantity >= item.maxQuantity && (
                          <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                            {language === "ar" ? "الحد الأقصى" : "Max"}
                          </Badge>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1">
                            <Link href={`/products/${item.productId}`} className="group">
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-base md:text-lg">
                                {language === "ar" ? item.name : item.nameEn}
                              </h3>
                            </Link>

                            {/* Product Attributes */}
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              {item.color && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-600">
                                    {language === "ar" ? "اللون:" : "Color:"}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <div
                                      className="w-3 h-3 rounded-full border border-gray-300"
                                      style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-xs font-medium">{language === "ar" ? item.color : item.colorEn}</span>
                                  </div>
                                </div>
                              )}
                              {item.size && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-600">
                                    {language === "ar" ? "المقاس:" : "Size:"}
                                  </span>
                                  <Badge variant="outline" className="text-xs py-0 px-2">
                                    {item.size}
                                  </Badge>
                                </div>
                              )}
                            </div>

                            {/* Stock Info */}
                            <div className="mt-3">
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${item.maxQuantity > 5 ? 'bg-blue-500' : 'bg-amber-500'}`} />
                                <span className="text-xs text-gray-600">
                                  {language === "ar"
                                    ? `${item.maxQuantity} قطعة متوفرة`
                                    : `${item.maxQuantity} in stock`}
                                </span>
                              </div>
                            </div>

                            {/* Quantity Controls - Mobile */}
                            <div className="flex items-center justify-between mt-4 sm:hidden">
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-r-none text-gray-600 hover:text-blue-600"
                                  onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                  disabled={updatingItemId === item._id || item.quantity <= 1}
                                >
                                  {updatingItemId === item._id && item.quantity - 1 === item.quantity ? (
                                    <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Minus className="h-3 w-3" />
                                  )}
                                </Button>
                                <div className="w-10 text-center font-medium text-sm">
                                  {updatingItemId === item._id ? (
                                    <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                  ) : (
                                    item.quantity
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-l-none text-gray-600 hover:text-blue-600"
                                  onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                  disabled={updatingItemId === item._id || item.quantity >= item.maxQuantity}
                                >
                                  {updatingItemId === item._id && item.quantity + 1 === item.quantity ? (
                                    <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Plus className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                  {item.price * item.quantity} {language === "ar" ? "ج.م" : "EGP"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {item.price} {language === "ar" ? "ج.م للقطعة" : "EGP each"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Layout */}
                          <div className="hidden sm:flex flex-col items-end justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-r-none text-gray-600 hover:text-blue-600"
                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                disabled={updatingItemId === item._id || item.quantity <= 1}
                              >
                                {updatingItemId === item._id && item.quantity - 1 === item.quantity ? (
                                  <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Minus className="h-3 w-3" />
                                )}
                              </Button>
                              <div className="w-10 text-center font-medium text-sm">
                                {updatingItemId === item._id ? (
                                  <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                ) : (
                                  item.quantity
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-l-none text-gray-600 hover:text-blue-600"
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                disabled={updatingItemId === item._id || item.quantity >= item.maxQuantity}
                              >
                                {updatingItemId === item._id && item.quantity + 1 === item.quantity ? (
                                  <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Plus className="h-3 w-3" />
                                )}
                              </Button>
                            </div>

                            {/* Price */}
                            <div className="text-right mt-4">
                              <div className="text-xl font-bold text-gray-900">
                                {item.price * item.quantity} {language === "ar" ? "ج.م" : "EGP"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.price} {language === "ar" ? "ج.م للقطعة" : "EGP each"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 text-sm"
                                disabled={loading || updatingItemId === item._id}
                              >
                                <Trash className="h-4 w-4 ml-2" />
                                {language === "ar" ? "إزالة" : "Remove"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-sm mx-auto">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                                  <AlertCircle className="h-5 w-5" />
                                  {language === "ar" ? "إزالة المنتج؟" : "Remove item?"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {language === "ar"
                                    ? "سيتم حذف هذا المنتج من السلة ولا يمكن التراجع عن ذلك."
                                    : "This product will be removed from your cart and cannot be undone."}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                <AlertDialogCancel className="w-full sm:w-auto">
                                  {language === "ar" ? "إلغاء" : "Cancel"}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveItem(item._id)}
                                  className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
                                >
                                  {language === "ar" ? "نعم، احذف" : "Yes, remove"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <div className="text-xs text-gray-500">
                            {item.maxQuantity - item.quantity > 0
                              ? language === "ar"
                                ? `${item.maxQuantity - item.quantity} متبقية`
                                : `${item.maxQuantity - item.quantity} left`
                              : language === "ar"
                                ? "انتهت الكمية"
                                : "Out of stock"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Cart Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                <Button
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300"
                >
                  <Link href="/products" className="gap-2">
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    {t("continueShopping")}
                  </Link>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full sm:w-auto"
                      disabled={loading || cartItems.some(item => updatingItemId === item._id)}
                    >
                      <Trash className="h-4 w-4 ml-2" />
                      {language === "ar" ? "إفراغ السلة" : "Clear Cart"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-sm mx-auto">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {language === "ar" ? "إفراغ السلة بالكامل؟" : "Clear entire cart?"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {language === "ar"
                          ? "سيتم حذف جميع المنتجات من السلة. لا يمكن التراجع عن هذه العملية."
                          : "All items in your cart will be removed. This action cannot be undone."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto">
                        {language === "ar" ? "إلغاء" : "Cancel"}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearCart}
                        className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
                      >
                        {language === "ar" ? "نعم، إفراغ" : "Yes, clear"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Order Summary - Right Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="border-blue-100 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <ShoppingCart className="h-5 w-5" />
                      {t("orderSummary")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 space-y-6">
                    {/* Price Breakdown */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("subtotal")}</span>
                        <span className="font-semibold text-gray-900">{subtotal} {language === "ar" ? "ج.م" : "EGP"}</span>
                      </div>

                      {cartData?.appliedCoupon && (
                        <div className="flex justify-between items-center text-blue-600 bg-blue-50 p-3 rounded-lg">
                          <span className="flex items-center gap-2 font-medium">
                            <Gift className="h-4 w-4" />
                            {language === "ar" ? "الخصم" : "Discount"}
                          </span>
                          <span className="font-bold">-{cartData.appliedCoupon.discountAmount} {language === "ar" ? "ج.م" : "EGP"}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("shipping")}</span>
                        <span className="font-semibold">
                          {shipping === 0 ? (
                            <span className="text-blue-600 font-bold">{language === "ar" ? "شحن مجاني" : "Free Shipping"}</span>
                          ) : (
                            `${shipping} ${language === "ar" ? "ج.م" : "EGP"}`
                          )}
                        </span>
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center text-lg font-bold">
                        <span className="text-gray-800">{t("total")}</span>
                        <div className="text-2xl text-blue-700">
                          {total} {language === "ar" ? "ج.م" : "EGP"}
                        </div>
                      </div>

                      {cartData?.appliedCoupon?.discountAmount && (
                        <div className="text-center text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <Sparkles className="h-4 w-4 inline ml-1" />
                          {language === "ar"
                            ? `لقد وفرت ${cartData.appliedCoupon.discountAmount} ج.م!`
                            : `You saved ${cartData.appliedCoupon.discountAmount} EGP!`}
                        </div>
                      )}
                    </div>

                    {/* Coupon Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                        <Tag className="h-4 w-4" />
                        {language === "ar" ? "كوبون الخصم" : "Coupon Code"}
                      </div>

                      {couponApplied || cartData?.appliedCoupon ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-blue-600" />
                              <div>
                                <div className="font-medium text-blue-800">
                                  {cartData?.appliedCoupon?.code || couponData?.coupon.code}
                                </div>
                                <div className="text-sm text-blue-700">
                                  {language === "ar"
                                    ? `وفرت ${cartData?.appliedCoupon?.discountAmount || couponData?.discountAmount} ج.م`
                                    : `Saved ${cartData?.appliedCoupon?.discountAmount || couponData?.discountAmount} EGP`}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveCoupon}
                              disabled={couponLoading}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2"
                            >
                              {couponLoading ? (
                                <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              placeholder={language === "ar" ? "أدخل كود الخصم" : "Enter coupon code"}
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              className="flex-1 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                            <Button
                              onClick={handleApplyCoupon}
                              disabled={couponLoading || !couponCode.trim()}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                            >
                              {couponLoading ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                language === "ar" ? "تطبيق" : "Apply"
                              )}
                            </Button>
                          </div>
                          {couponError && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md flex items-center gap-2 border border-red-200">
                              <AlertCircle className="h-4 w-4 flex-shrink-0" />
                              <span>{couponError}</span>
                            </div>
                          )}
                          <div className="text-xs text-blue-600 text-center">
                            {language === "ar"
                              ? "جرب: WELCOME10 للخصم على أول طلب"
                              : "Try: WELCOME10 for discount on first order"}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Security Badges */}
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium">{language === "ar" ? "دفع آمن" : "Secure Payment"}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Truck className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium">{language === "ar" ? "شحن سريع" : "Fast Shipping"}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Package className="h-4 w-4 text-purple-600" />
                        <span className="text-xs font-medium">{language === "ar" ? "تتبع الطلب" : "Order Tracking"}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Star className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-medium">{language === "ar" ? "ضمان الجودة" : "Quality Guarantee"}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 md:p-6 pt-0">
                    <Button
                      asChild
                      className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                      size="lg"
                    >
                      <Link href="/checkout" className="gap-2">
                        <CreditCard className="h-5 w-5" />
                        {t("checkout")}
                      </Link>
                    </Button>
                    <p className="text-center text-xs text-gray-500 mt-3">
                      {language === "ar"
                        ? "بإتمام الشراء، أنت توافق على شروطنا وسياسة الخصوصية"
                        : "By checking out, you agree to our Terms & Privacy Policy"}
                    </p>
                  </CardFooter>
                </Card>

                {/* Additional Info */}
                <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-amber-600" />
                      <span className="font-medium text-amber-800">{language === "ar" ? "معلومات هامة" : "Important Info"}</span>
                    </div>
                    <p className="text-sm text-amber-700">
                      {language === "ar"
                        ? "سيتم تأكيد المخزون والدفع قبل الشحن"
                        : "Stock confirmation & payment verification before shipping"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}