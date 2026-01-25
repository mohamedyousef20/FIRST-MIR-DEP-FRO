"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { orderService } from "@/lib/api";
import { toast } from "sonner";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | number;
}

export function OrderDetailsModal({ isOpen, onClose, orderId }: OrderDetailsModalProps) {
  const { language, t } = useLanguage();
  const isArabic = language === "ar";
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(Number(orderId));
      setOrder(response.data);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      setError(error.response?.data?.message || 'Failed to fetch order details');
      toast.error(isArabic ? "فشل جلب تفاصيل الطلب" : "Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
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

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {isArabic ? "تفاصيل الطلب" : "Order Details"}
          </DialogTitle>
        </DialogHeader>

        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold mb-2">{isArabic ? "معلومات الطلب" : "Order Info"}</h3>
            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground">{isArabic ? "رقم الطلب" : "Order #"}:</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{isArabic ? "التاريخ" : "Date"}:</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{isArabic ? "الحالة" : "Status"}:</span>
                <Badge
                  variant={
                    order.status === "completed" ? "default" :
                      order.status === "cancelled" ? "destructive" :
                        order.status === "processing" ? "outline" :
                          "secondary"
                  }
                >
                  {isArabic
                    ? (order.status === "pending" && "قيد المعالجة") ||
                    (order.status === "processing" && "في الطريق") ||
                    (order.status === "completed" && "مكتمل") ||
                    (order.status === "cancelled" && "ملغي")
                    : order.status}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">{isArabic ? "طريقة الدفع" : "Payment Method"}:</span>
                <Badge
                  variant={
                    order.paymentStatus === "paid" ? "default" :
                      order.paymentStatus === "failed" ? "destructive" :
                        "secondary"
                  }
                >
                  {isArabic
                    ? (order.paymentStatus === "pending" && "قيد الدفع") ||
                    (order.paymentStatus === "paid" && "مدفوع") ||
                    (order.paymentStatus === "failed" && "فشل")
                    : order.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">{isArabic ? "معلومات العميل" : "Customer Info"}</h3>
            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground">{isArabic ? "الاسم" : "Name"}:</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{isArabic ? "البريد الإلكتروني" : "Email"}:</span>
                <span>{order.customerEmail}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{isArabic ? "رقم الهاتف" : "Phone"}:</span>
                <span>{order.customerPhone}</span>
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
                <TableHead>{isArabic ? "السعر" : "Price"}</TableHead>
                <TableHead>{isArabic ? "الكمية" : "Quantity"}</TableHead>
                <TableHead>{isArabic ? "المبلغ الإجمالي" : "Total"}</TableHead>
                <TableHead>{isArabic ? "البائع" : "Vendor"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.products.map((product: any) => (
                <TableRow key={product.productId._id}>
                  <TableCell>{isArabic ? product.productId.name : product.productId.nameEn}</TableCell>
                  <TableCell className={isArabic ? "text-right" : "text-left"}>
                    {product.price} {isArabic ? "ج.م" : "EGP"}
                  </TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell className={isArabic ? "text-right" : "text-left"}>
                    {(product.price * product.quantity)} {isArabic ? "ج.م" : "EGP"}
                  </TableCell>
                  <TableCell>
                    {product.productId.vendor?.name || "N/A"}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="font-semibold text-right">
                  {isArabic ? "المبلغ الإجمالي" : "Total Amount"}
                </TableCell>
                <TableCell className={isArabic ? "text-right" : "text-left"}>
                  <span className="font-semibold">
                    {order.totalAmount} {isArabic ? "ج.م" : "EGP"}
                  </span>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Order Actions */}
        <div className="mt-6 flex flex-col gap-2">
          {order.status !== "completed" && order.status !== "cancelled" && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange("completed")}
            >
              {isArabic ? "إكمال الطلب" : "Complete Order"}
            </Button>
          )}
          {order.status !== "cancelled" && (
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
            >
              {isArabic ? "إلغاء الطلب" : "Cancel Order"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
