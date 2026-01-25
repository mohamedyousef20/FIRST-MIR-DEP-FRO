import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MirvoryPageLoader } from "@/components/MirvoryLoader";
import PaginationControls from "@/components/pagination-controls";
import { useRouter } from "next/navigation"; // Import useRouter
import { useCallback } from "react";

interface OrdersTabProps {
    orders: any[];
    loadingOrders: boolean;
    errorOrders: string | null;
    isArabic: boolean;
    pagination: { currentPage: number; totalPages: number };
    onPageChange: (page: number) => void;
    updateDeliveryStatus: (orderId: string, deliveryStatus: string) => void;
    updatePaymentStatus: (orderId: string, status: string) => void;
    orderComplete: (orderId: string, code: string) => void;
    markItemAsPrepared?: (orderId: string, itemId: string) => void;
}

export function OrdersTab({
    orders,
    loadingOrders,
    errorOrders,
    isArabic,
    pagination,
    onPageChange,
    updateDeliveryStatus,
    updatePaymentStatus,
    orderComplete,
    markItemAsPrepared
}: OrdersTabProps) {
    const router = useRouter();

    const handleOrderClick = useCallback((orderId: string, event: React.MouseEvent) => {
        // Prevent navigation if clicking on interactive elements
        const target = event.target as HTMLElement;

        // Check if the click target is or is inside an interactive element
        const isInteractiveElement =
            target.closest('button') ||
            target.closest('select') ||
            target.closest('input') ||
            target.closest('[role="combobox"]') ||
            target.closest('[data-interactive="true"]');

        if (!isInteractiveElement) {
            router.push(`/orders/${orderId}`);
        }
    }, [router]);

    if (loadingOrders) {
        return <MirvoryPageLoader text={isArabic ? "جاري التحميل..." : "Loading..."} />
    }

    if (errorOrders) {
        return <div className="text-red-500">{errorOrders}</div>;
    }

    // Helper function to get payment method label
    const getPaymentMethodLabel = (method: string) => {
        const labels: { [key: string]: { en: string; ar: string } } = {
            cash: { en: "Cash", ar: "كاش" },
            card: { en: "Card", ar: "بطاقة" },
            wallet: { en: "Wallet", ar: "محفظة" },
            vodafone_cash: { en: "Vodafone Cash", ar: "فودافون كاش" },
            paymob: { en: "Paymob", ar: "باي موب" }
        };
        return labels[method] || { en: method, ar: method };
    };

    // Helper function to get delivery method label
    const getDeliveryMethodLabel = (method: string) => {
        const labels: { [key: string]: { en: string; ar: string } } = {
            home: { en: "Home Delivery", ar: "توصيل منزل" },
            pickup: { en: "Store Pickup", ar: "استلام من المتجر" },
            express: { en: "Express", ar: "توصيل سريع" }
        };
        return labels[method] || { en: method, ar: method };
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                    {isArabic ? "إدارة الطلبات" : "Order Management"}
                </h2>
            </div>

            <div className="border rounded-lg overflow-auto max-h-[70vh]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{isArabic ? "رقم الطلب" : "Order ID"}</TableHead>
                            <TableHead>{isArabic ? "العميل" : "Customer"}</TableHead>
                            <TableHead>{isArabic ? "العناصر" : "Items"}</TableHead>
                            <TableHead>{isArabic ? "الكمية" : "Quantity"}</TableHead>
                            <TableHead>{isArabic ? "البائع" : "Seller"}</TableHead>
                            <TableHead>{isArabic ? "الهاتف" : "Phone"}</TableHead>
                            <TableHead>{isArabic ? "التاريخ" : "Date"}</TableHead>
                            <TableHead>{isArabic ? "المجموع الفرعي" : "Subtotal"}</TableHead>
                            <TableHead>{isArabic ? "الخصم" : "Discount"}</TableHead>
                            <TableHead>{isArabic ? "رسوم الشحن" : "Shipping Fee"}</TableHead>
                            <TableHead>{isArabic ? "الإجمالي" : "Total"}</TableHead>
                            <TableHead>{isArabic ? "طريقة الدفع" : "Payment Method"}</TableHead>
                            <TableHead>{isArabic ? "حالة الدفع" : "Payment Status"}</TableHead>
                            <TableHead>{isArabic ? "طريقة التوصيل" : "Delivery Method"}</TableHead>
                            <TableHead>{isArabic ? "حالة التوصيل" : "Delivery Status"}</TableHead>
                            <TableHead>{isArabic ? "العنوان" : "Address"}</TableHead>
                            <TableHead>{isArabic ? "معلومات المستلم" : "Recipient Info"}</TableHead>
                            <TableHead>{isArabic ? "حالة التجهيز" : "Preparation Status"}</TableHead>
                            <TableHead>{isArabic ? "عدد التفعيلات" : "Activation Count"}</TableHead>
                            <TableHead>{isArabic ? "عدد الإلغاءات" : "Cancel Count"}</TableHead>
                            <TableHead>{isArabic ? "حالة الدفع للبائع" : "Payout Status"}</TableHead>
                            <TableHead>{isArabic ? "تم التفعيل" : "Was Activated"}</TableHead>
                            <TableHead>{isArabic ? "تم الإلغاء" : "Was Canceled"}</TableHead>
                            <TableHead>{isArabic ? "كود التوصيل" : "Delivery Code"}</TableHead>
                            <TableHead>{isArabic ? "إكمال الطلب" : "Complete"}</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {orders.map((order: any) => {
                            const paymentMethodLabel = getPaymentMethodLabel(order.paymentMethod || 'cash');
                            const deliveryMethodLabel = getDeliveryMethodLabel(order.deliveryMethod || 'home');

                            return (
                                <TableRow
                                    key={order._id}
                                    onClick={(e) => handleOrderClick(order._id, e)}
                                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                                    data-order-id={order._id}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <span>#{order._id.substring(0, 6)}</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                />
                                            </svg>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-medium">
                                                {order.buyer?.fullName ||
                                                    `${order.buyer?.firstName || ''} ${order.buyer?.lastName || ''}`.trim() || "N/A"}
                                            </div>
                                            {order.buyer?.email && (
                                                <div className="text-xs text-gray-500">{order.buyer.email}</div>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* ITEMS */}
                                    <TableCell>
                                        <div className="max-w-[200px]">
                                            {order.items?.map((item: any, index: number) => (
                                                <div key={index} className="flex items-center gap-2 py-1 border-b last:border-b-0">
                                                    <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={item.product?.images?.[0] || "/placeholder-product.jpg"}
                                                            alt={item.product?.title || "Product"}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {isArabic ? item.product?.title : item.product?.titleEn || item.product?.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {item.color && `${isArabic ? "لون: " : "Color: "}${item.color}`}
                                                            {item.color && item.size && " • "}
                                                            {item.size && `${isArabic ? "مقاس: " : "Size: "}${item.size}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>

                                    {/* QUANTITY */}
                                    <TableCell>
                                        <div className="space-y-1">
                                            {order.items?.map((item: any, index: number) => (
                                                <div key={index} className="text-center">
                                                    <span className="inline-block bg-gray-100 px-2 py-1 rounded text-sm">
                                                        {item.quantity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>

                                    {/* SELLER - Full details */}
                                    <TableCell>
                                        <div className="space-y-2 max-w-[180px]">
                                            {order.items?.map((item: any, index: number) => (
                                                <div key={index} className="p-2 border rounded bg-gray-50">
                                                    <div className="font-medium text-sm">
                                                        {item.seller?.firstName && item.seller?.lastName
                                                            ? `${item.seller.firstName} ${item.seller.lastName}`
                                                            : item.seller?.fullName || "N/A"
                                                        }
                                                    </div>
                                                    <div className="text-xs text-gray-600 space-y-1 mt-1">
                                                        {item.seller?.phone && (
                                                            <div>{item.seller.phone}</div>
                                                        )}
                                                        {item.seller?.email && (
                                                            <div className="truncate">{item.seller.email}</div>
                                                        )}
                                                        {item.seller?.wallet && (
                                                            <div>{item.seller.wallet.balance || 0} EGP</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        {order.buyer?.phone || "N/A"}
                                    </TableCell>

                                    <TableCell>
                                        <div className="space-y-1">
                                            <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* SUBTOTAL */}
                                    <TableCell>
                                        <div className="font-medium">
                                            EGP {order.subtotal?.toFixed(2) || "0.00"}
                                        </div>
                                    </TableCell>

                                    {/* DISCOUNT */}
                                    <TableCell>
                                        <div className="text-red-600">
                                            -EGP {order.coupon?.discountAmount?.toFixed(2) || "0.00"}
                                        </div>
                                    </TableCell>

                                    {/* SHIPPING FEE */}
                                    <TableCell>
                                        <div className={order.shippingFee > 0 ? "text-blue-600" : "text-green-600"}>
                                            {order.shippingFee > 0 ? "+" : ""}EGP {order.shippingFee?.toFixed(2) || "0.00"}
                                        </div>
                                    </TableCell>

                                    {/* TOTAL */}
                                    <TableCell>
                                        <div className="font-bold">
                                            EGP {order.total?.toFixed(2) || "0.00"}
                                        </div>
                                    </TableCell>

                                    {/* PAYMENT METHOD */}
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`
                                                ${order.paymentMethod === 'cash' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                                                    order.paymentMethod === 'card' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                                        order.paymentMethod === 'wallet' ? 'bg-green-50 text-green-800 border-green-200' :
                                                            'bg-gray-50 text-gray-800 border-gray-200'}
                                            `}
                                        >
                                            {isArabic ? paymentMethodLabel.ar : paymentMethodLabel.en}
                                        </Badge>
                                    </TableCell>

                                    {/* PAYMENT STATUS */}
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Select
                                            value={order.paymentStatus || "pending"}
                                            onValueChange={(value) => updatePaymentStatus(order._id, value)}
                                        >
                                            <SelectTrigger className="w-[120px] no-row-click">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">
                                                    {isArabic ? "قيد الانتظار" : "Pending"}
                                                </SelectItem>
                                                <SelectItem value="paid">
                                                    {isArabic ? "مدفوع" : "Paid"}
                                                </SelectItem>
                                                <SelectItem value="failed">
                                                    {isArabic ? "فشل" : "Failed"}
                                                </SelectItem>
                                                <SelectItem value="completed">
                                                    {isArabic ? "مكتمل" : "Completed"}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>

                                    {/* DELIVERY METHOD */}
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="bg-purple-50 text-purple-800 border-purple-200"
                                        >
                                            {isArabic ? deliveryMethodLabel.ar : deliveryMethodLabel.en}
                                        </Badge>
                                    </TableCell>

                                    {/* DELIVERY STATUS */}
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Select
                                            value={order.deliveryStatus || "pending"}
                                            onValueChange={(value) => updateDeliveryStatus(order._id, value)}
                                        >
                                            <SelectTrigger className="w-[160px] no-row-click">
                                                <SelectValue />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="pending">
                                                    {isArabic ? "قيد الانتظار" : "Pending"}
                                                </SelectItem>
                                                <SelectItem value="shipped">
                                                    {isArabic ? "تم الشحن" : "Shipped"}
                                                </SelectItem>
                                                <SelectItem value="delivered">
                                                    {isArabic ? "تم التوصيل" : "Delivered"}
                                                </SelectItem>
                                                <SelectItem value="cancelled">
                                                    {isArabic ? "ملغي" : "Cancelled"}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>

                                    {/* ADDRESS */}
                                    <TableCell>
                                        <div className="max-w-[180px]">
                                            <p className="text-sm truncate">{order.deliveryAddress || order.deliveryInfo?.address || "N/A"}</p>
                                        </div>
                                    </TableCell>

                                    {/* RECIPIENT INFO */}
                                    <TableCell>
                                        <div className="space-y-1 max-w-[150px]">
                                            <div className="font-medium text-sm">
                                                {order.recipientInfo?.fullName || order.buyer?.fullName || "N/A"}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {order.recipientInfo?.phoneNumber || order.buyer?.phone || "N/A"}
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* PREPARATION STATUS - Whole Order */}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={order.isPrepared ? "default" : "secondary"}
                                                className={`
                                                    ${order.isPrepared
                                                        ? "bg-green-100 text-green-800 border-green-200"
                                                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                    }
                                                `}
                                            >
                                                {order.isPrepared
                                                    ? (isArabic ? "مجهز" : "Prepared")
                                                    : (isArabic ? "قيد التجهيز" : "Preparing")
                                                }
                                            </Badge>
                                        </div>
                                    </TableCell>

                                    {/* ACTIVATION COUNT */}
                                    <TableCell>
                                        <div className="text-center">
                                            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                                                {order.activateCount || 0}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* CANCEL COUNT */}
                                    <TableCell>
                                        <div className="text-center">
                                            <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-semibold">
                                                {order.cancelCount || 0}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* PAYOUT STATUS */}
                                    <TableCell>
                                        <Badge
                                            variant={order.payoutProcessed ? "default" : "secondary"}
                                            className={`
                                                ${order.payoutProcessed
                                                    ? "bg-green-100 text-green-800 border-green-200"
                                                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                }
                                            `}
                                        >
                                            {order.payoutProcessed
                                                ? (isArabic ? "تم الدفع" : "Paid")
                                                : (isArabic ? "قيد الانتظار" : "Pending")
                                            }
                                        </Badge>
                                    </TableCell>

                                    {/* WAS ACTIVATED */}
                                    <TableCell>
                                        <Badge
                                            variant={order.wasActivated ? "default" : "outline"}
                                            className={`
                                                ${order.wasActivated
                                                    ? "bg-green-100 text-green-800 border-green-200"
                                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                                }
                                            `}
                                        >
                                            {order.wasActivated
                                                ? (isArabic ? "نعم" : "Yes")
                                                : (isArabic ? "لا" : "No")
                                            }
                                        </Badge>
                                    </TableCell>

                                    {/* WAS CANCELED */}
                                    <TableCell>
                                        <Badge
                                            variant={order.wasCanceled ? "default" : "outline"}
                                            className={`
                                                ${order.wasCanceled
                                                    ? "bg-red-100 text-red-800 border-red-200"
                                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                                }
                                            `}
                                        >
                                            {order.wasCanceled
                                                ? (isArabic ? "نعم" : "Yes")
                                                : (isArabic ? "لا" : "No")
                                            }
                                        </Badge>
                                    </TableCell>

                                    {/* SECRET CODE */}
                                    <TableCell>
                                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                            {order.secretCode}
                                        </code>
                                    </TableCell>

                                    {/* COMPLETE ORDER BUTTON */}
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => orderComplete(order._id, order.secretCode)}
                                            disabled={order.deliveryStatus === "delivered"}
                                            className={`
                                                no-row-click
                                                ${order.deliveryStatus === "delivered"
                                                    ? "bg-gray-300 cursor-not-allowed"
                                                    : "bg-green-600 hover:bg-green-700"
                                                }
                                            `}
                                        >
                                            {order.deliveryStatus === "delivered"
                                                ? (isArabic ? "مكتمل" : "Completed")
                                                : (isArabic ? "إكمال" : "Complete")
                                            }
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        {/* Pagination */}
            {!loadingOrders && orders.length > 0 && (
                <PaginationControls
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={onPageChange}
                    className="justify-end pt-4"
                />
            )}
        </div>
    );
}