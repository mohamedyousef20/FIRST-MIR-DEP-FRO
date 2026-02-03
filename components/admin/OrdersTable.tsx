'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  Printer,
  MoreHorizontal,
  Search,
  Filter,
  CheckCircle,
  Truck,
  Clock,
  X,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import { orderService, Order } from '@/lib/api/services/orderService';
import { toast } from 'sonner';

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusIcons = {
  pending: <Clock className="h-4 w-4 mr-1" />,
  processing: <RefreshCw className="h-4 w-4 mr-1 animate-spin" />,
  shipped: <Truck className="h-4 w-4 mr-1" />,
  delivered: <CheckCircle className="h-4 w-4 mr-1" />,
  cancelled: <X className="h-4 w-4 mr-1" />,
};

const statusLabels = {
  pending: { en: 'Pending', ar: 'قيد الانتظار' },
  processing: { en: 'Processing', ar: 'قيد المعالجة' },
  shipped: { en: 'Shipped', ar: 'تم الشحن' },
  delivered: { en: 'Delivered', ar: 'تم التوصيل' },
  cancelled: { en: 'Cancelled', ar: 'ملغي' },
};

export function OrdersTable() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(isArabic ? 'حدث خطأ في جلب الطلبات' : 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (orderId: string) => {
    toast.info(isArabic ? 'جاري تحضير الفاتورة للطباعة...' : 'Preparing invoice for printing...');
  };

  const filteredOrders = orders.filter((order) => {
    const id = order.id ?? order._id;

    const matchesSearch = id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isArabic ? 'إدارة الطلبات' : 'Order Management'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isArabic ? 'عرض وإدارة جميع الطلبات' : 'View and manage all orders'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 w-full sm:w-64"
              placeholder={isArabic ? 'ابحث عن الطلبات...' : 'Search orders...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2 opacity-50" />
              <SelectValue placeholder={isArabic ? 'تصفية حسب الحالة' : 'Filter by status'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center">
                    {statusIcons[key as keyof typeof statusIcons]}
                    <span>{isArabic ? label.ar : label.en}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
            <TableRow>
              <TableHead className="w-[120px]">{isArabic ? 'رقم الطلب' : 'Order #'}</TableHead>
              <TableHead>{isArabic ? 'العميل' : 'Customer'}</TableHead>
              <TableHead className="hidden md:table-cell">{isArabic ? 'التاريخ' : 'Date'}</TableHead>
              <TableHead className="text-right">{isArabic ? 'المجموع' : 'Total'}</TableHead>
              <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
              <TableHead className="text-right">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    {isArabic ? 'جاري التحميل...' : 'Loading...'}
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  {isArabic ? 'لا توجد طلبات' : 'No orders found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const id = order.id ?? order._id;
                return (
                  <TableRow key={id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium mr-2">
                          {id.slice(-4)}
                        </span>
                        <span>#{id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customer?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{order.customer?.email || ''}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${order.totalAmount?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[order.status as keyof typeof statusStyles] || statusStyles.pending}`}>
                        {statusIcons[order.status as keyof typeof statusIcons] || statusIcons.pending}
                        <span>
                          {isArabic
                            ? statusLabels[order.status as keyof typeof statusLabels]?.ar || statusLabels.pending.ar
                            : statusLabels[order.status as keyof typeof statusLabels]?.en || statusLabels.pending.en}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                          onClick={() => handlePrint(id)}
                        >
                          <Printer className="h-4 w-4" />
                          <span className="sr-only">{isArabic ? 'طباعة الفاتورة' : 'Print invoice'}</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">{isArabic ? 'المزيد' : 'More'}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                              {isArabic ? 'تحديث الحالة' : 'Update Status'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              {isArabic ? 'إرسال تحديث' : 'Send Update'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              {isArabic ? 'إلغاء الطلب' : 'Cancel Order'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}