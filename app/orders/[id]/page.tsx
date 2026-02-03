"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, RotateCcw, Truck, CheckCircle, XCircle, Clock, ArrowLeft, Package, Home, Store, Eye, EyeOff, Copy, QrCode } from "lucide-react"
import { format } from "date-fns"
import { useLanguage } from "@/components/language-provider";
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { orderService } from "@/lib/api"
import { QRCodeSVG } from "qrcode.react"
import Image from "next/image"
import Link from "next/link"

type DeliveryStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled'
type PaymentStatus = 'pending' | 'paid' | 'failed'
type PaymentMethod = 'cash' | 'card'
type DeliveryMethod = 'home' | 'pickup'

interface OrderItem {
    _id: string
    product: {
        _id: string
        title: string
        titleEn?: string
        price: number
        images: string[]
    }
    seller: {
        _id: string
        name: string
        email: string
        phone?: string
    }
    quantity: number
    price: number
    color?: string
    size?: string
    isPrepared: boolean
}

interface OrderDetails {
    _id: string
    buyer: {
        _id: string
        name: string
        email: string
        phone?: string
    }
    items: OrderItem[]
    deliveryInfo: {
        fullName: string
        phoneNumber: string
        address: string
        pickupPoint?: {
            _id: string
            stationName: string
            address: string
            phone: string
        }
    }
    paymentMethod: PaymentMethod
    paymentStatus: PaymentStatus
    deliveryMethod: DeliveryMethod
    deliveryStatus: DeliveryStatus
    subtotal: number
    discount: number
    coupon?: {
        discountAmount: number
    }
    shippingFee: number
    total: number
    payoutProcessed: boolean
    isPrepared: boolean
    secretCode: string
    createdAt: string
    updatedAt: string
}

export default function OrderDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const { t } = useLanguage()
    const [order, setOrder] = useState<OrderDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [showSecretCode, setShowSecretCode] = useState(false)

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true)
                const idStr = Array.isArray(id) ? id[0] : id;
                if (!idStr) throw new Error('Invalid order id');
                const response = await orderService.getOrderById(idStr as string);
                //console.log('API Response:', response);

                if (response?.data) {
                    setOrder(response.data);
                    //console.log('Order set to state:', response.data);
                } else {
                    console.error('No data found in response:', response);
                    toast.error('حدث خطأ أثناء جلب تفاصيل الطلب')
                }
            } catch (error) {
                console.error('Error fetching order details:', error)
                toast.error('حدث خطأ أثناء جلب تفاصيل الطلب')
            } finally {
                setLoading(false)
            }
        }

        fetchOrderDetails()
    }, [id, t])

    useEffect(() => {
        //console.log('Order state updated:', order);
    }, [order]);

    const getDeliveryStatusInfo = (status: DeliveryStatus) => {
        switch (status) {
            case 'pending':
                return {
                    text: 'قيد الانتظار',
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: <Clock className="h-4 w-4" />
                }
            case 'shipped':
                return {
                    text: 'تم الشحن',
                    color: 'bg-blue-100 text-blue-800',
                    icon: <Truck className="h-4 w-4" />
                }
            case 'delivered':
                return {
                    text: 'تم التوصيل',
                    color: 'bg-green-100 text-green-800',
                    icon: <CheckCircle className="h-4 w-4" />
                }
            case 'cancelled':
                return {
                    text: 'ملغي',
                    color: 'bg-red-100 text-red-800',
                    icon: <XCircle className="h-4 w-4" />
                }
            default:
                return {
                    text: 'غير معروف',
                    color: 'bg-gray-100 text-gray-800',
                    icon: null
                }
        }
    }

    const getPaymentStatusInfo = (status: PaymentStatus) => {
        switch (status) {
            case 'paid':
                return {
                    text: 'مدفوع',
                    color: 'bg-green-100 text-green-800'
                }
            case 'pending':
                return {
                    text: 'قيد الانتظار',
                    color: 'bg-yellow-100 text-yellow-800'
                }
            case 'failed':
                return {
                    text: 'فشل الدفع',
                    color: 'bg-red-100 text-red-800'
                }
            default:
                return {
                    text: 'غير معروف',
                    color: 'bg-gray-100 text-gray-800'
                }
        }
    }

    const getPaymentMethodInfo = (method: PaymentMethod) => {
        switch (method) {
            case 'cash':
                return 'الدفع عند الاستلام'
            case 'card':
                return 'بطاقة ائتمان'
            default:
                return method
        }
    }

    const getDeliveryMethodInfo = (method: DeliveryMethod) => {
        switch (method) {
            case 'home':
                return {
                    text: 'توصيل للمنزل',
                    icon: <Home className="h-4 w-4" />
                }
            case 'pickup':
                return {
                    text: 'استلام من نقطة التوصيل',
                    icon: <Store className="h-4 w-4" />
                }
            default:
                return {
                    text: method,
                    icon: <Package className="h-4 w-4" />
                }
        }
    }

    const toggleSecretCode = () => {
        setShowSecretCode(!showSecretCode);
    }

    const formatSecretCode = (code: string) => {
        if (!showSecretCode) {
            return '••••••••';
        }
        return code;
    }

    if (loading) {
        return (
            <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">جاري تحميل تفاصيل الطلب...</p>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="container mx-auto py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">الطلب غير موجود</h2>
                <p className="text-muted-foreground mb-6">عذراً، لا يمكن العثور على تفاصيل الطلب المطلوبة</p>
                <Button onClick={() => router.push('/profile/orders')}>
                    العودة إلى طلباتي
                </Button>
            </div>
        )
    }

    const deliveryStatusInfo = getDeliveryStatusInfo(order.deliveryStatus)
    const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus)
    const deliveryMethodInfo = getDeliveryMethodInfo(order.deliveryMethod)
    const qrPayload = JSON.stringify({ orderId: order._id, secretCode: order.secretCode })

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    تفاصيل الطلب رقم  #{order._id.slice(0, 8)}

                    <button
                        onClick={() => navigator.clipboard.writeText(order._id)}
                        className="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-md"
                    >
                        <Copy />
                    </button>
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Summary */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">ملخص الطلب</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge className={deliveryStatusInfo.color}>
                                        {deliveryStatusInfo.icon}
                                        <span className="mr-1">{deliveryStatusInfo.text}</span>
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item._id} className="flex gap-4 pb-4 border-b">
                                            <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                                                <Image
                                                    src={item.product.images?.[0] || '/placeholder-product.jpg'}
                                                    alt={item.product.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <h3 className="font-medium">{item.product.title}</h3>
                                                    {/* رقم المنتج القابل للنسخ */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            رقم المنتج:
                                                        </span>
                                                        <div
                                                            className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs cursor-pointer hover:bg-gray-200 transition-colors"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(item.product._id);
                                                                toast.success("تم نسخ رقم المنتج")
                                                            }}
                                                            title="انقر للنسخ"
                                                        >
                                                            <code className="font-mono">
                                                                #{item.product._id?.substring(0, 8)}...
                                                            </code>
                                                            <svg
                                                                className="h-3 w-3 text-gray-500"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    <p className="text-sm text-muted-foreground">
                                                        الكمية: {item.quantity}
                                                    </p>
                                                    {item.color && (
                                                        <Badge variant="outline" className="text-xs">
                                                            اللون: {item.color}
                                                        </Badge>
                                                    )}
                                                    {item.size && (
                                                        <Badge variant="outline" className="text-xs">
                                                            المقاس: {item.size}
                                                        </Badge>
                                                    )}
                                                    {item.isPrepared && (
                                                        <Badge className="bg-green-100 text-green-800 text-xs">
                                                            تم التجهيز
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="font-medium mt-1">{item.price * item.quantity} ج.م</p>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span>المجموع الفرعي</span>
                                            <span>{order.subtotal} ج.م</span>
                                        </div>
                                        <div className="flex justify-between text-green-600">
                                            <span>الخصم</span>
                                            <span>-{order.discount} ج.م</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>الشحن</span>
                                            <span>{order.shippingFee} ج.م</span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>الإجمالي</span>
                                            <span>{order.total} ج.م</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {deliveryMethodInfo.icon}
                                معلومات التوصيل
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Badge variant="outline">
                                        {deliveryMethodInfo.text}
                                    </Badge>
                                </div>

                                {order.deliveryMethod === 'home' ? (
                                    <div className="space-y-2">
                                        <p className="font-medium">{order.deliveryInfo?.fullName}</p>
                                        <p>{order.deliveryInfo?.address}</p>
                                        <p className="pt-2">
                                            <span className="text-muted-foreground">الهاتف:</span> {order.deliveryInfo?.phoneNumber}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="font-medium">{order.deliveryInfo?.pickupPoint?.stationName}</p>
                                        <p>{order.deliveryInfo.pickupPoint?.address}</p>
                                        <p className="text-muted-foreground">
                                            الهاتف: {order.deliveryInfo?.pickupPoint?.phone}
                                        </p>
                                        <p className="pt-2 text-sm">
                                            <span className="font-medium">المستلم:</span> {order.deliveryInfo?.fullName}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Actions & Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>معلومات الدفع</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">طريقة الدفع</span>
                                <span>{getPaymentMethodInfo(order.paymentMethod)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">حالة الدفع</span>
                                <Badge className={paymentStatusInfo.color}>
                                    {paymentStatusInfo.text}
                                </Badge>
                            </div>
                            {order.payoutProcessed && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">تم تحويل الأرباح</span>
                                    <Badge className="bg-green-100 text-green-800">
                                        مكتمل
                                    </Badge>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">تاريخ الطلب</span>
                                <span>{format(new Date(order.createdAt), 'dd/MM/yyyy')}</span>
                            </div>
                            <div className="flex justify-between items-center border p-3 rounded-xl bg-gray-50">
                                <span className="text-muted-foreground font-medium">الكود السري</span>

                                <div className="flex items-center gap-3">
                                    <Badge
                                        variant="outline"
                                        className="font-mono text-base py-1 px-3 rounded-lg bg-white shadow-sm border-gray-300"
                                    >
                                        {showSecretCode ? formatSecretCode(order.secretCode) : "••••••"}
                                    </Badge>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={toggleSecretCode}
                                        className="h-8 w-8 rounded-lg border-gray-300 hover:bg-gray-100"
                                    >
                                        {showSecretCode ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            navigator.clipboard.writeText(order.secretCode);
                                            toast.success("تم نسخ الكود السري");
                                        }}
                                        className="h-8 w-8 rounded-lg border-gray-300 hover:bg-gray-100"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* QR Code Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="h-5 w-5" />
                                QR Code للطلب
                            </CardTitle>
                            <CardDescription>
                                استخدم هذا الكود لتحقيق الطلب عند الاستلام
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4">
                            <div className="p-4 bg-white rounded-lg border">
                                <QRCodeSVG
                                    value={qrPayload}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                            <p className="text-sm text-center text-muted-foreground">
                                يمكن للمسوق مسح هذا الكود عند تسليم الطلب
                            </p>
                        </CardContent>
                    </Card>

                    <div className="space-y-2">
                        {order.deliveryStatus === 'delivered' && (
                            <Button
                                variant="outline"
                                className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                                asChild
                            >
                                <Link
                                    href={`/returns/new?orderId=${order._id}`}
                                    className="flex items-center gap-2"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    طلب إرجاع
                                </Link>
                            </Button>

                        )}
                        {order.deliveryStatus === 'shipped' && (
                            <Button variant="outline" className="w-full">
                                تتبع الشحنة
                            </Button>
                        )}

                        {order.deliveryStatus === 'pending' && (
                            <Button variant="outline" className="w-full" onClick={() => router.push('/contact')}>
                                الاتصال بالدعم
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}