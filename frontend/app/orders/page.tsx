"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner"
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { orderService, paymentService } from '@/lib/api';
import { MirvoryPageLoader } from '@/components/MirvoryLoader';
import {
    Package,
    ShoppingBag,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
    ExternalLink,
    ChevronLeft,
    ShoppingCart,
    Filter,
    Calendar,
    MapPin,
    CreditCard,
    User,
    Phone,
    MoreVertical,
    Download,
    Repeat,
   Headset,
    Star,
    AlertCircle,
    ChevronRight,
    Home,
    Sparkles,
    BadgeCheck,
    Shield,
    Loader2
} from 'lucide-react';

// Components
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Badge
} from "@/components/ui/badge";
import {
    Button
} from "@/components/ui/button";
import {
    Progress
} from "@/components/ui/progress";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface OrderItem {
    _id: string;
    product: {
        _id: string;
        title?: string;
        name?: string;
        price: number;
        images: string[];
    };
    quantity: number;
    price: number;
    colors?: string[];
    sizes?: string[];
}

interface Order {
    _id: string;
    orderNumber?: string;
    items: OrderItem[];
    total: number;
    subtotal?: number;
    shippingFee?: number;
    discount?: number;
    deliveryStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    createdAt: string;
    updatedAt?: string;
    paidAt?: string;
    deliveryAddress?: string;
    deliveryMethod?: string;
    recipientInfo?: {
        fullName: string;
        phoneNumber: string;
    };
    trackingNumber?: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [processingPayment, setProcessingPayment] = useState<string | null>(null);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await orderService.getUserOrders();
            if (response?.data) {
                setOrders(response.data);
            } else {
                toast.error('حدث خطأ أثناء جلب الطلبات')
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    type PayMethod = 'card' | 'wallet';

    const handleCompletePayment = async (orderId: string, method: PayMethod) => {
        try {
            setProcessingPayment(orderId);
            const res = await paymentService.createPaymentSession({ orderId, paymentMethod: method });
            const { redirectUrl, iframeUrl } = res.data || {};
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else if (iframeUrl) {
                window.location.href = iframeUrl;
            } else {
                toast.error('فشل إنشاء جلسة الدفع');
            }
        } catch (error) {
            console.error('Payment session error:', error);
            toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء جلسة الدفع');
        } finally {
            setProcessingPayment(null);
        }
    };

    const refreshOrders = async () => {
        setRefreshing(true);
        await fetchOrders();
        setRefreshing(false);
        toast.success('تم تحديث الطلبات');
    };

    const getStatusConfig = (deliveryStatus: Order['deliveryStatus']) => {
        const configs = {
            pending: {
                icon: Clock,
                color: 'bg-amber-500',
                text: 'قيد الانتظار',
                description: 'في انتظار تأكيد الدفع',
                bgColor: 'bg-amber-50',
                textColor: 'text-amber-700',
                borderColor: 'border-amber-200'
            },
            processing: {
                icon: Package,
                color: 'bg-blue-500',
                text: 'قيد المعالجة',
                description: 'جاري تجهيز الطلب',
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-700',
                borderColor: 'border-blue-200'
            },
            shipped: {
                icon: Truck,
                color: 'bg-purple-500',
                text: 'تم الشحن',
                description: 'في طريق التوصيل',
                bgColor: 'bg-purple-50',
                textColor: 'text-purple-700',
                borderColor: 'border-purple-200'
            },
            delivered: {
                icon: CheckCircle,
                color: 'bg-emerald-500',
                text: 'تم التوصيل',
                description: 'تم التسليم بنجاح',
                bgColor: 'bg-emerald-50',
                textColor: 'text-emerald-700',
                borderColor: 'border-emerald-200'
            },
            cancelled: {
                icon: XCircle,
                color: 'bg-rose-500',
                text: 'ملغي',
                description: 'تم إلغاء الطلب',
                bgColor: 'bg-rose-50',
                textColor: 'text-rose-700',
                borderColor: 'border-rose-200'
            },
            returned: {
                icon: Repeat,
                color: 'bg-slate-500',
                text: 'مرتجع',
                description: 'تم إرجاع الطلب',
                bgColor: 'bg-slate-50',
                textColor: 'text-slate-700',
                borderColor: 'border-slate-200'
            }
        };
        return configs[deliveryStatus] || configs.pending;
    };

    const getPaymentStatusConfig = (paymentStatus: Order['paymentStatus']) => {
        const configs = {
            pending: {
                color: 'bg-amber-100 text-amber-800',
                text: 'بانتظار الدفع'
            },
            paid: {
                color: 'bg-emerald-100 text-emerald-800',
                text: 'مدفوع'
            },
            failed: {
                color: 'bg-rose-100 text-rose-800',
                text: 'فشل الدفع'
            },
            refunded: {
                color: 'bg-slate-100 text-slate-800',
                text: 'تم الاسترجاع'
            }
        };
        return configs[paymentStatus] || configs.pending;
    };

    const getDeliveryProgress = (status: Order['deliveryStatus']) => {
        const progress = {
            pending: 25,
            processing: 50,
            shipped: 75,
            delivered: 100,
            cancelled: 0,
            returned: 0
        };
        return progress[status] || 0;
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true;
        return order.deliveryStatus === activeTab;
    }).sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === 'oldest') {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortBy === 'highest') {
            return b.total - a.total;
        } else {
            return a.total - b.total;
        }
    });

    const getOrderStats = () => {
        return {
            total: orders.length,
            pending: orders.filter(o => o.deliveryStatus === 'pending').length,
            processing: orders.filter(o => o.deliveryStatus === 'processing').length,
            shipped: orders.filter(o => o.deliveryStatus === 'shipped').length,
            delivered: orders.filter(o => o.deliveryStatus === 'delivered').length,
            totalSpent: orders.reduce((sum, order) => sum + order.total, 0)
        };
    };

    const stats = getOrderStats();

    if (loading) {
        return (<MirvoryPageLoader text= " جاري تحميل طلباتك..."  />

        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center">
                        <div className="relative inline-block mb-8">
                            <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-16 h-16 text-primary/60" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        <div className="max-w-md mx-auto mb-10">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                لا توجد طلبات حتى الآن
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                ابدأ رحلة التسوق واكتشف منتجاتنا المميزة
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">تصفح المنتجات</h3>
                                <p className="text-sm text-gray-600">اكتشف آلاف المنتجات المميزة</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                                    <BadgeCheck className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">توصيل سريع</h3>
                                <p className="text-sm text-gray-600">توصيل في جميع أنحاء مصر</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                                    <Shield className="w-6 h-6 text-amber-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">دفع آمن</h3>
                                <p className="text-sm text-gray-600">مدفوعات مشفرة وآمنة</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                onClick={() => router.push('/')}
                                className="px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                <ShoppingBag className="w-5 h-5 ml-2" />
                                ابدأ التسوق الآن
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => router.push('/products')}
                                className="px-8 py-6 text-lg rounded-xl"
                            >
                                تصفح الكتالوج
                                <ExternalLink className="w-5 h-5 mr-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl">
                                <ShoppingBag className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    طلباتي
                                </h1>
                                <p className="text-gray-600 mt-1 flex items-center gap-2">
                                    <span>تتبع جميع طلباتك في مكان واحد</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {stats.total} طلب
                                    </Badge>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={refreshOrders}
                                disabled={refreshing}
                                size="sm"
                                className="gap-2"
                            >
                                {refreshing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Repeat className="w-4 h-4" />
                                )}
                                تحديث
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/')}
                                size="sm"
                                className="gap-2"
                            >
                                <Home className="w-4 h-4" />
                                العودة للرئيسية
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                        <div className="text-sm text-gray-600">إجمالي الطلبات</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                        <div className="text-sm text-gray-600">قيد الانتظار</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
                        <div className="text-sm text-gray-600">قيد التجهيز</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
                        <div className="text-sm text-gray-600">تم الشحن</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-2xl font-bold text-emerald-600">{stats.delivered}</div>
                        <div className="text-sm text-gray-600">تم التوصيل</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-2xl font-bold text-gray-900">
                            {stats.totalSpent.toFixed(2)} ج.م
                        </div>
                        <div className="text-sm text-gray-600">إجمالي المشتريات</div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Filters and Tabs */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                            <TabsList className="grid grid-cols-6 md:w-fit">
                                <TabsTrigger value="all" className="gap-2">
                                    <Filter className="w-4 h-4" />
                                    الكل
                                </TabsTrigger>
                                <TabsTrigger value="pending" className="gap-2">
                                    <Clock className="w-4 h-4" />
                                    في الانتظار
                                </TabsTrigger>
                                <TabsTrigger value="processing" className="gap-2">
                                    <Package className="w-4 h-4" />
                                    قيد التجهيز
                                </TabsTrigger>
                                <TabsTrigger value="shipped" className="gap-2">
                                    <Truck className="w-4 h-4" />
                                    تم الشحن
                                </TabsTrigger>
                                <TabsTrigger value="delivered" className="gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    تم التسليم
                                </TabsTrigger>
                                <TabsTrigger value="cancelled" className="gap-2">
                                    <XCircle className="w-4 h-4" />
                                    ملغية
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex items-center gap-3">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[180px]">
                                    <Calendar className="w-4 h-4 ml-2" />
                                    <SelectValue placeholder="ترتيب حسب" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">الأحدث أولاً</SelectItem>
                                    <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                                    <SelectItem value="highest">الأعلى سعراً</SelectItem>
                                    <SelectItem value="lowest">الأقل سعراً</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Orders Grid */}
                <div className="space-y-6">
                    {filteredOrders.map((order) => {
                        const statusConfig = getStatusConfig(order.deliveryStatus);
                        const StatusIcon = statusConfig.icon;
                        const paymentConfig = getPaymentStatusConfig(order.paymentStatus);
                        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                        const isExpanded = expandedOrder === order._id;

                        return (
                            <Card key={order._id} className={`overflow-hidden border-2 transition-all hover:border-primary/30 ${statusConfig.borderColor}`}>
                                <CardHeader className="pb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl ${statusConfig.bgColor}`}>
                                                <StatusIcon className={`w-6 h-6 ${statusConfig.textColor}`} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg mb-1">
                                                    طلب #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                                                </CardTitle>
                                                <CardDescription className="flex flex-wrap items-center gap-3">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {format(new Date(order.createdAt), 'dd MMMM yyyy', { locale: ar })}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Package className="w-4 h-4" />
                                                        {itemCount} منتج
                                                    </span>
                                                    <Badge variant="outline" className={paymentConfig.color}>
                                                        {paymentConfig.text}
                                                    </Badge>
                                                </CardDescription>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {order.total.toFixed(2)} ج.م
                                                </div>
                                                {order.subtotal && (
                                                    <div className="text-sm text-gray-500 line-through">
                                                        {order.subtotal.toFixed(2)} ج.م
                                                    </div>
                                                )}
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>خيارات الطلب</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => router.push(`/orders/${order._id}`)}>
                                                        <ExternalLink className="w-4 h-4 ml-2" />
                                                        عرض التفاصيل
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Download className="w-4 h-4 ml-2" />
                                                        تحميل الفاتورة
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Headset className="w-4 h-4 ml-2" />
                                                        مساعدة
                                                    </DropdownMenuItem>
                                                    {order.deliveryStatus === 'delivered' && (
                                                        <DropdownMenuItem>
                                                            <Star className="w-4 h-4 ml-2" />
                                                            تقييم المنتجات
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pb-4">
                                    {/* Progress Bar */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <StatusIcon className={`w-4 h-4 ${statusConfig.textColor}`} />
                                                <span className={`font-medium ${statusConfig.textColor}`}>
                                                    {statusConfig.text}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500">{statusConfig.description}</span>
                                        </div>
                                        <Progress value={getDeliveryProgress(order.deliveryStatus)} className="h-2" />
                                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                                            <span>تم التوصيل</span>
                                            <span>تم الشحن</span>
                                            <span>قيد المعالجة</span>
                                            <span>تم الطلب</span>

                                        </div>
                                    </div>

                                    {/* Products Preview */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-gray-900">المنتجات</h3>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                                                className="text-primary gap-1"
                                            >
                                                {isExpanded ? 'إظهار أقل' : 'إظهار المزيد'}
                                                <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                            {order.items.slice(0, isExpanded ? order.items.length : 5).map((item) => (
                                                <div
                                                    key={item._id}
                                                    className="group relative bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                                                    onClick={() => router.push(`/products/${item.product._id}`)}
                                                >
                                                    <div className="aspect-square rounded-lg overflow-hidden bg-white mb-2">
                                                        <img
                                                            src={item.product?.images?.[0] || '/placeholder-product.jpg'}
                                                            alt={item.product?.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {item.product?.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            الكمية: {item.quantity}
                                                        </p>
                                                        <p className="text-sm font-semibold text-primary mt-1">
                                                            {(item.price * item.quantity).toFixed(2)} ج.م
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            {!isExpanded && order.items.length > 5 && (
                                                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-3 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-gray-700 mb-1">
                                                            +{order.items.length - 5}
                                                        </div>
                                                        <div className="text-xs text-gray-600">منتجات أخرى</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <h4 className="font-medium text-gray-900">عنوان التوصيل</h4>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {order.deliveryAddress || 'لم يتم تحديد عنوان'}
                                            </p>
                                            {order.recipientInfo && (
                                                <div className="mt-3 space-y-1 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        <span>{order.recipientInfo.fullName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                        <span>{order.recipientInfo.phoneNumber}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Truck className="w-4 h-4 text-gray-500" />
                                                <h4 className="font-medium text-gray-900">معلومات التوصيل</h4>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">طريقة التوصيل:</span>
                                                    <span className="font-medium">{order.deliveryMethod || 'توصيل منزلي'}</span>
                                                </div>
                                                {order.trackingNumber && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">رقم التتبع:</span>
                                                        <span className="font-medium text-primary">{order.trackingNumber}</span>
                                                    </div>
                                                )}
                                                {order.updatedAt && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">آخر تحديث:</span>
                                                        <span className="font-medium">
                                                            {format(new Date(order.updatedAt), 'dd/MM/yyyy')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <CreditCard className="w-4 h-4 text-gray-500" />
                                                <h4 className="font-medium text-gray-900">ملخص الطلب</h4>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">المجموع:</span>
                                                    <span>{order.subtotal?.toFixed(2) || order.total.toFixed(2)} ج.م</span>
                                                </div>
                                                {order.shippingFee && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">الشحن:</span>
                                                        <span>{order.shippingFee.toFixed(2)} ج.م</span>
                                                    </div>
                                                )}
                                                {order.discount && (
                                                    <div className="flex justify-between text-emerald-600">
                                                        <span>الخصم:</span>
                                                        <span>-{order.discount.toFixed(2)} ج.م</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                                    <span>الإجمالي:</span>
                                                    <span className="text-primary">{order.total.toFixed(2)} ج.م</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="bg-gray-50 border-t pt-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/orders/${order._id}`)}
                                                className="gap-2"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                عرض التفاصيل الكاملة
                                            </Button>
                                            {order.deliveryStatus === 'delivered' && (
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <Star className="w-4 h-4" />
                                                    تقييم الطلب
                                                </Button>
                                            )}
                                        
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => router.push('/contact')}
                                            >
                                                <Headset className="w-4 h-4" />
                                                طلب المساعدة
                                            </Button>

                                        </div>
                                        {order.paymentStatus === 'pending' && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        className="gap-2"
                                                        disabled={processingPayment === order._id}
                                                    >
                                                        {processingPayment === order._id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <CreditCard className="w-4 h-4" />
                                                        )}
                                                        {processingPayment === order._id ? 'جاري التحويل...' : 'إتمام الدفع'}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleCompletePayment(order._id, 'card')}>
                                                        بطاقة بنكية (Card)
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleCompletePayment(order._id, 'wallet')}>
                                                        محفظة إلكترونية (Wallet)
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredOrders.length === 0 && activeTab !== 'all' && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            لا توجد طلبات في هذه الفئة
                        </h3>
                        <p className="text-gray-600 mb-6">
                            لا يوجد لديك طلبات بحالة "{getStatusConfig(activeTab as any).text}"
                        </p>
                        <Button
                            onClick={() => setActiveTab('all')}
                            variant="outline"
                            className="gap-2"
                        >
                            عرض جميع الطلبات
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}

                {/* Pagination / Info */}
                {filteredOrders.length > 0 && (
                    <div className="mt-8 pt-6 border-t">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="text-sm text-gray-600">
                                عرض <span className="font-semibold">{filteredOrders.length}</span> من أصل <span className="font-semibold">{orders.length}</span> طلب
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-semibold">نصيحة:</span> يمكنك الضغط على أي منتج لعرض تفاصيله
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}