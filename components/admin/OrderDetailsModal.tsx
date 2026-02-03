"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { orderService, Order } from "@/lib/api/services/orderService";
import { toast } from "sonner";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

interface ProductItem {
  productId: {
    _id: string;
    name: string;
    nameEn?: string;
    vendor?: {
      name: string;
    };
  };
  price: number;
  quantity: number;
}

interface DetailedOrder extends Order {
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  products?: ProductItem[];
  paymentStatus?: string;
}

const statusLabels = {
  pending: { en: "Pending", ar: "قيد الانتظار" },
  processing: { en: "Processing", ar: "قيد المعالجة" },
  shipped: { en: "Shipped", ar: "تم الشحن" },
  delivered: { en: "Delivered", ar: "تم التوصيل" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
  completed: { en: "Completed", ar: "مكتمل" }
};

const paymentStatusLabels = {
  pending: { en: "Pending", ar: "قيد الدفع" },
  paid: { en: "Paid", ar: "مدفوع" },
  failed: { en: "Failed", ar: "فشل" },
  completed: { en: "Completed", ar: "مكتمل" }
};

export function OrderDetailsModal({ isOpen, onClose, orderId }: OrderDetailsModalProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [order, setOrder] = useState<DetailedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(orderId);
      setOrder(response as DetailedOrder);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch order details';
      setError(errorMessage);
      toast.error(isArabic ? "فشل جلب تفاصيل الطلب" : "Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    } else {
      setOrder(null);
      setError(null);
      setLoading(true);
    }
  }, [isOpen, orderId]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(isArabic ? "تم تحديث حالة الطلب" : "Order status updated");
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleCancelOrder = async () => {
    try {
      await orderService.cancelOrder(orderId);
      toast.success(isArabic ? "تم إلغاء الطلب" : "Order cancelled");
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (!order && !loading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isArabic ? "تفاصيل الطلب" : "Order Details"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">{isArabic ? "جاري التحميل..." : "Loading..."}</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            {error}
          </div>
        ) : order && (
          <>
            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold mb-2">{isArabic ? "معلومات الطلب" : "Order Info"}</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-muted-foreground">{isArabic ? "رقم الطلب" : "Order #"}: </span>
                    <span className="font-medium">#{order.orderNumber || order.id || order._id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isArabic ? "التاريخ" : "Date"}: </span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isArabic ? "الحالة" : "Status"}: </span>
                    <Badge
                      variant={
                        order.status === "delivered" || order.status === "completed" ? "default" :
                        order.status === "cancelled" ? "destructive" :
                        order.status === "processing" ? "outline" :
                        "secondary"
                      }
                    >
                      {isArabic
                        ? statusLabels[order.status as keyof typeof statusLabels]?.ar || order.status
                        : statusLabels[order.status as keyof typeof statusLabels]?.en || order.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isArabic ? "طريقة الدفع" : "Payment Method"}: </span>
                    <Badge
                      variant={
                        order.paymentStatus === "paid" ? "default" :
                        order.paymentStatus === "failed" ? "destructive" :
                        "secondary"
                      }
                    >
                      {isArabic
                        ? paymentStatusLabels[order.paymentStatus as keyof typeof paymentStatusLabels]?.ar || order.paymentStatus
                        : paymentStatusLabels[order.paymentStatus as keyof typeof paymentStatusLabels]?.en || order.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">{isArabic ? "معلومات العميل" : "Customer Info"}</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-muted-foreground">{isArabic ? "الاسم" : "Name"}: </span>
                    <span className="font-medium">{order.customerName || order.customer?.name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isArabic ? "البريد الإلكتروني" : "Email"}: </span>
                    <span>{order.customerEmail || order.customer?.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isArabic ? "رقم الهاتف" : "Phone"}: </span>
                    <span>{order.customerPhone || order.customer?.phone || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Products */}
            <div>
              <h3 className="font-semibold mb-4">{isArabic ? "المنتجات" : "Products"}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? "المنتج" : "Product"}</TableHead>
                    <TableHead className="text-right">{isArabic ? "السعر" : "Price"}</TableHead>
                    <TableHead className="text-right">{isArabic ? "الكمية" : "Quantity"}</TableHead>
                    <TableHead className="text-right">{isArabic ? "المبلغ الإجمالي" : "Total"}</TableHead>
                    <TableHead>{isArabic ? "البائع" : "Vendor"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.products?.map((product: ProductItem) => (
                    <TableRow key={product.productId?._id || Math.random().toString()}>
                      <TableCell>{isArabic ? product.productId?.name : product.productId?.nameEn || product.productId?.name}</TableCell>
                      <TableCell className="text-right">
                        {product.price?.toFixed(2)} {isArabic ? "ج.م" : "EGP"}
                      </TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell className="text-right">
                        {((product.price || 0) * (product.quantity || 0)).toFixed(2)} {isArabic ? "ج.م" : "EGP"}
                      </TableCell>
                      <TableCell>
                        {product.productId?.vendor?.name || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="font-semibold text-right">
                      {isArabic ? "المبلغ الإجمالي" : "Total Amount"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold">
                        {order.totalAmount?.toFixed(2)} {isArabic ? "ج.م" : "EGP"}
                      </span>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Order Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-end">
              {order.status !== "delivered" && order.status !== "completed" && order.status !== "cancelled" && (
                <Button
                  variant="default"
                  onClick={() => handleStatusChange("delivered")}
                >
                  {isArabic ? "تأكيد التسليم" : "Mark as Delivered"}
                </Button>
              )}
              {order.status !== "cancelled" && order.status !== "delivered" && order.status !== "completed" && (
                <Button
                  variant="destructive"
                  onClick={handleCancelOrder}
                >
                  {isArabic ? "إلغاء الطلب" : "Cancel Order"}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}