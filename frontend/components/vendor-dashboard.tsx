"use client"

import { SetStateAction, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PaginationControls from "@/components/pagination-controls"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  DollarSign,
  Package,
  ShoppingBag,
  Plus,
  Search,
  Edit,
  Trash,
  Eye,
  ArrowUpDown,
  MoreHorizontal,
  Check,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  XCircle,
  Save,
  Loader2,
  X,
} from "lucide-react"
import {
  apiServices,
  categoryService,
  orderService,
  productService,
  returnService,
  userService
} from "@/lib/api"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { string } from "zod"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { MirvoryPageLoader } from "./MirvoryLoader"

interface OrderItem {
  _id: string
  product: {
    _id: string
    title: string
    titleEn: string
    images: string[]
  }
  quantity: number
  price: number
  color?: string
  size?: string
  isPrepared?: boolean
}

interface Order {
  _id: string
  buyer: {
    _id: string
    firstName: string
    lastName: string
  }
  items: OrderItem[]
  deliveryInfo: {
    fullName: string
    phoneNumber: string
    address: string
  }
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  discount: number
  shippingFee: number
  total: number
  deliveryMethod: string
  deliveryStatus: string
  createdAt: string
  updatedAt: string
  buyerName?: string
  formattedItems?: Array<{
    productName: string
    productImage: string
    quantity: number
    price: number
  }>
}

interface Product {
  _id: string
  title: string
  titleEn: string
  images: string[]
  price: number
  discountPercentage: number
  discountedPrice: number
  quantity: number
  status: string
  category: string | {
    _id?: string
    name: string
    nameEn: string
  },
  sold: number
  ratings: {
    average: number
    count: number
  }
  createdAt: string
  updatedAt: string
}

type ReturnStatus = 'pending' | 'approved' | 'processing' | 'ready_for_pickup' | 'received' | 'rejected' | 'finished'

interface ReturnRequest {
  _id: string
  order: {
    _id: string
    secretCode?: string
  }
  product: {
    _id: string
    title?: string
    titleEn?: string
    images?: string[]
  }
  seller: string | { _id: string }
  reason: string
  images?: string[]
  status: ReturnStatus
  createdAt: string
  updatedAt: string
}

interface OrderActivityLogEntry {
  _id: string
  action: string
  description?: string
  actor?: {
    firstName?: string
    lastName?: string
    role?: string
  }
  actorRole?: string
  createdAt: string
}

interface AnalyticsData {
  ordersPerDay: Array<{ _id: string; count: number }>
  topSellingProducts: Array<{ _id: string; title: string; sold: number; ratingsAverage?: number }>
  highestRatedProducts: Array<{ _id: string; title: string; ratingsAverage: number; sold?: number }>
  avgPreparationTime: number
  satisfactionScore: number
}

interface FinancialTransaction {
  _id: string
  amount: number
  type: 'credit' | 'debit'
  balanceAfter: number
  source: string
  status: 'pending' | 'completed' | 'failed'
  note?: string
  createdAt: string
}

export function VendorDashboard() {
  const { language, t } = useLanguage()
  const { sellerDashboardService } = apiServices
  const [activeTab, setActiveTab] = useState("overview")
  const [products, setProducts] = useState<Product[]>([])
  const [balance, setBalance] = useState({})
  const [user, setUser] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [preparingOrderId, setPreparingOrderId] = useState<string | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  interface EditingProductData {
    title?: string
    price?: number | string
    discountPercentage?: number | string
    quantity?: number | string
    status?: string
    category?: string
  }

  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editingProductData, setEditingProductData] = useState<EditingProductData>({})
  const [updatingProductId, setUpdatingProductId] = useState(null);
  const [categories, setCategories] = useState([]);
  // Filter product states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortOption, setSortOption] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [totalProducts, setTotalProducts] = useState(0);
  // Filter product states
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('recent');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([])
  // Dashboard counters
  const [dashboardCounters, setDashboardCounters] = useState({ newOrders: 0, ongoingOrders: 0, returns: 0, reviews: 0 });
  // Transactions
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [transactionPage, setTransactionPage] = useState(1)
  const [transactionTotalPages, setTransactionTotalPages] = useState(1)
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'all' | 'credit' | 'debit'>('all')
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  // Analytics
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  // Order activity
  const [activityLogs, setActivityLogs] = useState<OrderActivityLogEntry[]>([])
  const [activityPage, setActivityPage] = useState(1)
  const [activityTotalPages, setActivityTotalPages] = useState(1)
  const [selectedOrderForActivity, setSelectedOrderForActivity] = useState<string | null>(null)
  const [activityLoading, setActivityLoading] = useState(false)
  const [returnTab, setReturnTab] = useState("adminPending")

  useEffect(() => {
    const fetchDashboardCounters = async () => {
      try {
        const res = await sellerDashboardService.getCounters();
        //console.log(res.data,'vdboard')
        setDashboardCounters(res.data)
      } catch (error: any) {
        console.error('Failed to fetch dashboard counters', error)
      }
    }

    fetchDashboardCounters()
  }, [])

  // Handler for filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => {
      if (value === 'all') {
        const newFilters = { ...prev };
        delete newFilters[filterType];
        return newFilters;
      }

      if (filterType === 'isPrepared') {
        return { ...prev, [filterType]: value === 'prepared' };
      }

      return { ...prev, [filterType]: value };
    });
  };

  // Handler for search
  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      $or: [
        { 'deliveryInfo.fullName': { $regex: searchTerm, $options: 'i' } },
        { 'deliveryInfo.phoneNumber': { $regex: searchTerm, $options: 'i' } },
        { secretCode: { $regex: searchTerm, $options: 'i' } }
      ]
    }));
  };

  // Clear all filters
  const clearOrderFilters = () => {
    setFilters({});
    setSearchTerm('');
    setSortBy('recent');
  };
  //console.log(products, 'mmm')
  // Apply filters and sorting to orders
  useEffect(() => {
    let result = [...orders];

    // Apply filters
    if (filters.deliveryStatus) {
      result = result.filter(order => order.deliveryStatus === filters.deliveryStatus);
    }

    if (filters.isPrepared !== undefined) {
      result = result.filter(order => order.isPrepared === filters.isPrepared);
    }

    if (filters.$or) {
      result = result.filter(order =>
        filters.$or.some(condition => {
          if (condition['deliveryInfo.fullName']) {
            return order.deliveryInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
          }
          if (condition['deliveryInfo.phoneNumber']) {
            return order.deliveryInfo?.phoneNumber?.includes(searchTerm);
          }
          if (condition.secretCode) {
            return order.secretCode?.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return false;
        })
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'total-high':
        result.sort((a, b) => b.total - a.total);
        break;
      case 'total-low':
        result.sort((a, b) => a.total - b.total);
        break;
    }

    setFilteredOrders(result);
  }, [orders, filters, sortBy, searchTerm]);

  useEffect(() => {
    if (orders.length > 0 && !selectedOrderForActivity) {
      setSelectedOrderForActivity(orders[0]._id);
    }
  }, [orders, selectedOrderForActivity]);

  const clearProductFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setStatusFilter("all");
    setPriceRange([0, 10000]);
    setSortOption("newest");
    setPage(1);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data);
      } catch (error) {
        toast.error(language === 'ar' ? 'فشل جلب الفئات' : 'Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  const fetchSellerTransactions = async (options?: { page?: number; type?: 'all' | 'credit' | 'debit' }) => {
    const pageToLoad = options?.page ?? transactionPage
    const typeToLoad = options?.type ?? transactionTypeFilter
    setTransactionsLoading(true)
    try {
      const res = await sellerDashboardService.getTransactions({
        page: pageToLoad,
        limit: 10,
        type: typeToLoad !== 'all' ? typeToLoad : undefined
      })
      const data = res.data
      setTransactions(data.transactions || [])
      setTransactionTotalPages(data.pagination?.totalPages || 1)
      if (data.pagination?.currentPage) setTransactionPage(data.pagination.currentPage);
    } catch (err) {
      console.error('Failed to fetch transactions', err)
      toast.error(language === 'ar' ? 'فشل في جلب المعاملات' : 'Failed to load transactions')
    } finally {
      setTransactionsLoading(false)
    }
  }

  // Fetch transactions when tab active or filters/page change
  useEffect(() => {
    if (activeTab !== 'transactions') return
    fetchSellerTransactions()
  }, [activeTab, transactionPage, transactionTypeFilter])

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true)
    setAnalyticsError(null)
    try {
      const res = await sellerDashboardService.getAnalytics()
      setAnalytics(res.data.data)
    } catch (err) {
      console.error('Failed to fetch analytics', err)
      setAnalyticsError(language === 'ar' ? 'تعذر تحميل التحليلات' : 'Failed to load analytics')
    } finally {
      setAnalyticsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab !== 'analytics') return
    if (!analytics) {
      fetchAnalyticsData()
    }
  }, [activeTab])

  const fetchOrderActivityLogs = async (options?: { orderId?: string; page?: number }) => {
    const orderId = options?.orderId || selectedOrderForActivity
    const pageToLoad = options?.page ?? activityPage
    if (!orderId) return
    setActivityLoading(true)
    try {
      const res = await sellerDashboardService.getOrderActivity(orderId, { page: pageToLoad, limit: 10 })
      const data = res.data
      setActivityLogs(data.logs || [])
      setActivityTotalPages(data.pagination?.pages || 1)
    } catch (err) {
      console.error('Failed to fetch order activity', err)
      toast.error(language === 'ar' ? 'فشل في تحميل سجل الطلب' : 'Failed to load order activity')
    } finally {
      setActivityLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab !== 'activity') return
    if (!selectedOrderForActivity) return
    fetchOrderActivityLogs()
  }, [activeTab, selectedOrderForActivity, activityPage])


  //console.log(editingProductData, editingProductData)
  const handleEditProduct = (product: Product) => {
    setEditingProductId(product._id)
    setEditingProductData({
      title: product.title,
      price: product.price,
      discountPercentage: product.discountPercentage,
      quantity: product.quantity,
      status: product.status,
      category: typeof product.category === "object" ? product.category?._id : product.category
    })
  }

  const handleUpdateProduct = async (productId: string) => {
    if (!productId) return

    const updates: Record<string, any> = { ...editingProductData }

    if (updates.price !== undefined && updates.price !== "") {
      updates.price = Number(updates.price)
    }
    if (updates.discountPercentage !== undefined && updates.discountPercentage !== "") {
      updates.discountPercentage = Number(updates.discountPercentage)
    }
    if (updates.quantity !== undefined && updates.quantity !== "") {
      updates.quantity = Number(updates.quantity)
    }

    setUpdatingProductId(productId)
    try {
      await productService.updateProduct(productId, updates)

      toast.success(
        language === "ar" ? "تم إرسال التعديلات للمراجعة" : "Product update submitted for review"
      )

      const productsResponse = await productService.getSellerProducts()
      setProducts(productsResponse.data.products || productsResponse.data)

      setEditingProductId(null)
      setEditingProductData({})
    } catch (error: any) {
      console.error('Error updating product:', error)
      toast.error(
        error.response?.data?.message ||
        error.message ||
        (language === "ar" ? "فشل تحديث المنتج" : "Failed to update product")
      )
    } finally {
      setUpdatingProductId(null)
    }
  }

  const handleConfirmPreparation = async (orderId: string) => {
    try {
      setPreparingOrderId(orderId);
      // Then confirm the preparation with the verification 
      await orderService.confirmPreparation(orderId);
      // Show success message
      toast.success('تم تأكيد تجهيز الطلب بنجاح');
    } catch (error) {
      console.error('Error confirming preparation:', error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`حدث خطأ أثناء تأكيد تجهيز الطل: ${errorMessage}`

      );
    } finally {
      setPreparingOrderId(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      setDeletingProductId(productId);
      // Then confirm the preparation with the verification code
      const response = await productService.deleteProduct(productId);
      // Show success message
      toast.success('تم حذف المنتج بنجاح');
    } catch (error) {
      console.error('Error Deleting Product:', error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(` حدث خطأ أثناء حذف المنتج : ${errorMessage}`

      );
    } finally {
      setDeletingProductId(null);
    }
  };


  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query params for products
        const params = {
          page,
          limit: pageSize,
          category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          sort: sortOption === "newest" ? "-createdAt" :
            sortOption === "priceHighToLow" ? "-price" :
              sortOption === "priceLowToHigh" ? "price" :
                sortOption === "topRated" ? "-ratings.average" :
                  sortOption === "mostSold" ? "-sold" : undefined,
          search: searchTerm || undefined,
          isApproved: true
        };

        // Clean up undefined params
        Object.keys(params).forEach(key => {
          if (params[key] === undefined) {
            delete params[key];
          }
        });

        // Fetch products with filters, orders, and return requests in parallel
        const [productsResponse, ordersResponse, returnRequestsResponse] = await Promise.all([
          productService.getSellerProducts(params),
          orderService.getSellerOrders(),
          returnService.getReturnRequests()
        ]);

        setProducts(productsResponse.data.products || productsResponse.data);
        setTotalProducts(productsResponse.data.pagination.total || productsResponse.data.length);
        //console.log(productsResponse, 'productsResponse')
        // Format orders data
        const formattedOrders = ordersResponse.data.map(order => ({
          ...order,
          buyerName: order.buyer
            ? `${order.buyer.firstName} ${order.buyer.lastName}`
            : 'Unknown Buyer',
          formattedItems: order.items.map(item => ({
            productName: language === "ar"
              ? item.product?.title || 'No Name'
              : item.product?.titleEn || 'No Name',
            productImage: item.product?.images?.[0] || '/placeholder.svg',
            quantity: item.quantity,
            price: item.price
          }))
        }));

        setOrders(formattedOrders);

        setReturnRequests(returnRequestsResponse.data || [])

        // Fetch balance data
        const balanceResponse = await userService.getSellerBalance();
        //console.log(balance, 'xfd')
        setBalance(balanceResponse.data.data.wallet);
        //console.log(balanceResponse.data?.data.wallet, 'ds')

        // Fetch user data
        const userResponse = await userService.getProfile();
        setUser(userResponse.data);

        // Fetch categories if needed
        const categoriesResponse = await categoryService.getCategories();
        //console.log(categoriesResponse.data, 'categoriesResponse')
        setCategories(categoriesResponse.data);

      } catch (err) {
        setError(err.message || 'Failed to fetch data');
        console.error('Error fetching vendor data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [
    language,
    page,
    pageSize,
    selectedCategories,
    statusFilter,
    priceRange,
    sortOption,
    searchTerm
  ]);

  const sellerReturnRequests = useMemo(() => {
    if (!user || !user._id) return []
    return returnRequests.filter((request) => {
      const sellerId = typeof request.seller === "object" ? request.seller?._id : request.seller
      return sellerId?.toString() === user._id?.toString()
    })
  }, [returnRequests, user])

  const pendingAdminReturns = useMemo(() => sellerReturnRequests.filter(request => request.status === 'pending'), [sellerReturnRequests])
  const sellerActionReturns = useMemo(
    () => sellerReturnRequests.filter(request => ['approved', 'processing', 'ready_for_pickup'].includes(request.status)),
    [sellerReturnRequests]
  )
  const completedReturns = useMemo(
    () => sellerReturnRequests.filter(request => ['received', 'finished', 'rejected'].includes(request.status)),
    [sellerReturnRequests]
  )

  const currentReturnList = useMemo(() => {
    switch (returnTab) {
      case 'sellerAction':
        return sellerActionReturns
      case 'completed':
        return completedReturns
      case 'adminPending':
      default:
        return pendingAdminReturns
    }
  }, [returnTab, pendingAdminReturns, sellerActionReturns, completedReturns])

  const returnTabMeta = useMemo(() => ([
    {
      key: 'adminPending',
      title: language === 'ar' ? 'بانتظار موافقة الإدارة' : 'Awaiting admin approval',
      description: language === 'ar' ? 'الطلبات الجديدة ستظهر هنا قبل وصولها إليك' : 'New requests appear here before you act',
      count: pendingAdminReturns.length
    },
    {
      key: 'sellerAction',
      title: language === 'ar' ? 'تم موافقة الإدارة' : ' admin approval ',
      description: language === 'ar' ? 'طلبات تمت الموافقة عليها وفى انتطار عملية الارجاع ' : 'Approved requests that need your handling',
      count: sellerActionReturns.length
    },
    {
      key: 'completed',
      title: language === 'ar' ? 'مكتملة / مرفوضة' : 'Completed / Rejected',
      description: language === 'ar' ? 'طلبات تم إنهاؤها أو رفضها' : 'Requests that are finalized',
      count: completedReturns.length
    }
  ]), [language, pendingAdminReturns.length, sellerActionReturns.length, completedReturns.length])

  const getReturnStatusLabel = (status: ReturnStatus) => {
    const labels: Record<ReturnStatus, { ar: string; en: string }> = {
      pending: { ar: 'بانتظار موافقة الإدارة', en: 'Waiting for admin approval' },
      approved: { ar: 'تم موافقة الإدارة', en: 'Awaiting seller action' },
      processing: { ar: 'قيد المعالجة', en: 'Processing' },
      ready_for_pickup: { ar: 'جاهز للاستلام', en: 'Ready for pickup' },
      received: { ar: 'تم الاستلام', en: 'Received' },
      rejected: { ar: 'مرفوض', en: 'Rejected' },
      finished: { ar: 'مكتمل', en: 'Finished' }
    }

    return labels[status]?.[language === 'ar' ? 'ar' : 'en'] || status
  }

  const renderReturnTable = (data: ReturnRequest[]) => {
    if (!data.length) {
      return (
        <div className="text-center py-10 border rounded-md">
          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold">
            {language === 'ar' ? 'لا توجد طلبات في هذا القسم' : 'No requests in this section'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {language === 'ar'
              ? 'سيتم تحويل الطلبات إلى هنا بعد موافقة الإدارة'
              : 'Requests will appear here once they reach this stage'}
          </p>
        </div>
      )
    }

    return (
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{language === 'ar' ? 'رقم الطلب' : 'Order'}</TableHead>
              <TableHead>{language === 'ar' ? 'المنتج' : 'Product'}</TableHead>
              <TableHead>{language === 'ar' ? 'السبب' : 'Reason'}</TableHead>
              <TableHead>{language === 'ar' ? 'الصور' : 'Images'}</TableHead>
              <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
              <TableHead>{language === 'ar' ? 'آخر تحديث' : 'Updated'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((request) => (
              <TableRow key={request._id}>
                <TableCell className="font-medium">
                  #{request.order?._id?.slice(-6) || request._id.slice(-6)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {language === 'ar'
                        ? request.product?.title || '—'
                        : request.product?.titleEn || request.product?.title || '—'}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                      {request.reason}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[220px] text-sm">
                  {request.reason}
                </TableCell>
                <TableCell className="max-w-[220px]">
                  {request.images?.length > 0 ? (
                    <img
                      src={request.images[0]}
                      alt="Return request image"
                      className="h-16 w-16 object-cover rounded-md border"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-sm text-gray-400">No image</span>
                  )}
                </TableCell>

                <TableCell>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {request.status === 'pending' && <Clock className="h-3 w-3" />}
                    {(request.status === 'approved' || request.status === 'processing') && <Check className="h-3 w-3" />}
                    {request.status === 'rejected' && <XCircle className="h-3 w-3" />}
                    {getReturnStatusLabel(request.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(request.updatedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (loading) {
    return (
      <MirvoryPageLoader text={language === "ar" ? "جاري التحميل..." : "Loading..."} />

    )
  }

  if (error) {
    return (
      <div className="container px-4 py-6 md:py-10">
        <div className="bg-destructive/10 p-4 rounded-md border border-destructive">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6 md:py-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("vendorDashboard")}</h1>
          <p className="text-muted-foreground">
            {language === "ar"
              ? "مرحبًا بك في لوحة تحكم البائع، يمكنك إدارة منتجاتك وطلباتك من هنا."
              : "Welcome to your vendor dashboard, manage your products and orders from here."}
          </p>
        </div>
        <Button asChild>
          <Link href="/vendor/dashboard/products/new">
            <Plus className="h-4 w-4 mr-2" />
            {language === "ar" ? "إضافة منتج جديد" : "Add New Product"}
          </Link>
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap gap-2">
          {[
            { value: 'overview', label: language === "ar" ? "نظرة عامة" : "Overview" },
            { value: 'analytics', label: language === 'ar' ? 'التحليلات' : 'Analytics' },
            { value: 'transactions', label: language === 'ar' ? 'المعاملات' : 'Transactions' },
            { value: 'orders', label: t("orders") },
            { value: 'products', label: t("products") },
            { value: 'returns', label: language === "ar" ? "طلبات الإرجاع" : "Returns" },
            { value: 'activity', label: language === 'ar' ? 'سجل الطلبات' : 'Order Activity' },
          ].map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex-1 min-w-[140px]">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Dashboard counters */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                key: 'newOrders',
                title: language === 'ar' ? 'طلبات جديدة' : 'New Orders',
                value: dashboardCounters.newOrders,
                icon: <ShoppingBag className="h-4 w-4 text-muted-foreground" />,
              },
              {
                key: 'ongoingOrders',
                title: language === 'ar' ? 'طلبات قيد التنفيذ' : 'Ongoing Orders',
                value: dashboardCounters.ongoingOrders,
                icon: <Clock className="h-4 w-4 text-muted-foreground" />,
              },
              {
                key: 'returns',
                title: language === 'ar' ? 'مرتجعات' : 'Returns',
                value: dashboardCounters.returns,
                icon: <XCircle className="h-4 w-4 text-muted-foreground" />,
              },
              {
                key: 'reviews',
                title: language === 'ar' ? 'تقييمات' : 'Reviews',
                value: dashboardCounters.reviews,
                icon: <Star className="h-4 w-4 text-muted-foreground" />,
              },
            ].map(stat => (
              <Card key={stat.key} className="border border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{stat.value ?? 0}</div>

                </CardContent>
              </Card>
            ))}
          </div>

          {/* Legacy stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                key: 'totalSales',
                title: language === "ar" ? "إجمالي المبيعات" : "Total Sales",
                value: balance.balance.toFixed(2),
                icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
                change: language === "ar" ? "الرصيد الإجمالي" : "Overall balance"
              },
              {
                key: 'orders',
                title: language === "ar" ? "الطلبات" : "Orders",
                value: orders.length,
                icon: <ShoppingBag className="h-4 w-4 text-muted-foreground" />,
                change: "+2"
              },
              {
                key: 'products',
                title: language === "ar" ? "المنتجات" : "Products",
                value: products.length,
                icon: <Package className="h-4 w-4 text-muted-foreground" />,
                change: "+2"
              },
              {
                key: 'availableBalance',
                title: t("balance"),
                value: balance.availableBalance.toFixed(2),
                icon: <BarChart className="h-4 w-4 text-muted-foreground" />,
                change: language === "ar" ? "متاح للسحب" : "Available"
              },
              {
                key: 'pendingBalance',
                title: language === "ar" ? "الرصيد المعلق" : "Pending Balance",
                value: balance.pendingBalance.toFixed(2),
                icon: <BarChart className="h-4 w-4 text-muted-foreground" />,
                change: language === "ar" ? "قيد المراجعة" : "Pending"
              }

            ].map((stat) => (
              <Card key={stat.key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stat.value ?? 0} {stat.title.toLowerCase().includes("balance") || stat.title.toLowerCase().includes("sales")
                      ? language === "ar" ? "ج.م" : "EGP"
                      : ""}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Orders Card */}
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>{language === "ar" ? "أحدث الطلبات" : "Recent Orders"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === "ar" ? "رقم الطلب" : "Order ID"}</TableHead>
                      <TableHead>{language === "ar" ? "العناصر" : "Items"}</TableHead>
                      <TableHead className="text-right">{language === "ar" ? "الإجمالي" : "Total"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 5).map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">#{order._id.slice(-6)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {order.formattedItems?.slice(0, 3).map((item, i) => (
                              <span key={i} className="text-sm">
                                {item.productName}{i < (order.formattedItems?.length || 0) - 1 && ','}
                              </span>
                            ))}
                            {(order.formattedItems?.length || 0) > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{(order.formattedItems?.length || 0) - 3} more
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {order.total} {language === "ar" ? "ج.م" : "EGP"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Top Products Card */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>{language === "ar" ? "المنتجات الأكثر مبيعًا" : "Top Selling Products"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.slice(0, 4).map((product) => (
                    <div key={product._id} className="flex items-center gap-4">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden">
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={language === "ar" ? product.title : product.titleEn}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {language === "ar" ? product.title : product.titleEn}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === "ar" ? "المخزون: " : "Stock: "}
                          {product.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {product.price} {language === "ar" ? "ج.م" : "EGP"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>{language === 'ar' ? 'ملخص الأداء' : 'Performance Overview'}</CardTitle>
                <CardDescription>
                  {language === 'ar'
                    ? 'نقدّم لك لمحة عن الطلبات، المنتجات الأعلى، ومستوى رضا العملاء.'
                    : 'Key insights about orders, products, and satisfaction.'}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchAnalyticsData} disabled={analyticsLoading}>
                {analyticsLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {language === 'ar' ? 'تحديث البيانات' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {analyticsLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {language === 'ar' ? 'جاري تحميل التحليلات...' : 'Loading analytics...'}
                </div>
              )}
              {analyticsError && (
                <div className="text-sm text-red-500">{analyticsError}</div>
              )}
              {!analyticsLoading && !analyticsError && analytics && (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        key: 'avgPrep',
                        title: language === 'ar' ? 'متوسط زمن التجهيز (ساعات)' : 'Avg Preparation (hours)',
                        value: analytics.avgPreparationTime.toFixed(1)
                      },
                      {
                        key: 'satisfaction',
                        title: language === 'ar' ? 'رضا العملاء' : 'Satisfaction score',
                        value: analytics.satisfactionScore.toFixed(2)
                      },
                      {
                        key: 'topSellCount',
                        title: language === 'ar' ? 'أفضل المنتجات مبيعًا' : 'Top sellers',
                        value: analytics.topSellingProducts.length
                      },
                      {
                        key: 'topRatedCount',
                        title: language === 'ar' ? 'أعلى المنتجات تقييمًا' : 'Top rated',
                        value: analytics.highestRatedProducts.length
                      }
                    ].map(metric => (
                      <Card key={metric.key} className="bg-muted/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-muted-foreground">{metric.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-semibold">{metric.value}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">{language === 'ar' ? 'عدد الطلبات آخر 30 يوم' : 'Orders last 30 days'}</h3>
                      <div className="space-y-1 max-h-72 overflow-y-auto pr-2">
                        {analytics.ordersPerDay.length === 0 ? (
                          <p className="text-sm text-muted-foreground">{language === 'ar' ? 'لا يوجد بيانات' : 'No data'}</p>
                        ) : (
                          analytics.ordersPerDay.map(day => (
                            <div key={day._id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                              <span>{day._id}</span>
                              <span className="font-medium">{day.count}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold">{language === 'ar' ? 'الأكثر مبيعًا' : 'Top selling products'}</h3>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                          {analytics.topSellingProducts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{language === 'ar' ? 'لا يوجد بيانات' : 'No data'}</p>
                          ) : (
                            analytics.topSellingProducts.map((product) => (
                              <div key={product._id} className="rounded-md border p-3 text-sm">
                                <p className="font-semibold truncate">{product.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {language === 'ar' ? 'مبيعات' : 'Sold'}: {product.sold}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold">{language === 'ar' ? 'الأعلى تقييمًا' : 'Highest rated'}</h3>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                          {analytics.highestRatedProducts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{language === 'ar' ? 'لا يوجد بيانات' : 'No data'}</p>
                          ) : (
                            analytics.highestRatedProducts.map((product) => (
                              <div key={product._id} className="rounded-md border p-3 text-sm">
                                <p className="font-semibold truncate">{product.title}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Star className="h-3 w-3 text-amber-500" />
                                  {product.ratingsAverage?.toFixed(2)}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{language === 'ar' ? 'المعاملات المالية' : 'Financial Transactions'}</CardTitle>
                <CardDescription>
                  {language === 'ar'
                    ? 'تتبع أرصدتك وسجل جميع العمليات المالية'
                    : 'Track your wallet balance and payout history'}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Select
                  value={transactionTypeFilter}
                  onValueChange={(val: 'all' | 'credit' | 'debit') => {
                    setTransactionPage(1)
                    setTransactionTypeFilter(val)
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={language === 'ar' ? 'نوع المعاملة' : 'Transaction type'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                    <SelectItem value="credit">{language === 'ar' ? 'إيداع (Credit)' : 'Credit'}</SelectItem>
                    <SelectItem value="debit">{language === 'ar' ? 'سحب (Debit)' : 'Debit'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
                      <TableHead>{language === 'ar' ? 'المصدر' : 'Source'}</TableHead>
                      <TableHead>{language === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الرصيد بعد العملية' : 'Balance After'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {language === 'ar' ? 'جاري تحميل المعاملات...' : 'Loading transactions...'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {language === 'ar'
                            ? 'لا توجد معاملات في الفترة الحالية'
                            : 'No transactions found for this period'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((txn) => (
                        <TableRow key={txn._id}>
                          <TableCell>#{txn._id.slice(-6)}</TableCell>
                          <TableCell>
                            <Badge variant={txn.type === 'credit' ? 'secondary' : 'outline'}>
                              {txn.type === 'credit'
                                ? language === 'ar'
                                  ? 'إيداع'
                                  : 'Credit'
                                : language === 'ar'
                                  ? 'سحب'
                                  : 'Debit'}
                            </Badge>
                          </TableCell>
                          <TableCell>{txn.source}</TableCell>
                          <TableCell className={`font-semibold ${txn.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {txn.type === 'credit' ? '+' : '-'}
                            {txn.amount.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}
                          </TableCell>
                          <TableCell>
                            {txn.balanceAfter?.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                txn.status === 'completed'
                                  ? 'success'
                                  : txn.status === 'pending'
                                    ? 'outline'
                                    : 'destructive'
                              }
                            >
                              {language === 'ar'
                                ? txn.status === 'completed'
                                  ? 'مكتملة'
                                  : txn.status === 'pending'
                                    ? 'معلقة'
                                    : 'فاشلة'
                                : txn.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(txn.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {transactions.length > 0 && (
                <PaginationControls
                  currentPage={transactionPage}
                  totalPages={transactionTotalPages}
                  onPageChange={setTransactionPage}
                  className="justify-end pt-4"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {/* Filter Header */}


          {/* Active Filters Display */}
          {(selectedCategories.length > 0 || statusFilter !== "all" || priceRange[0] > 0 || priceRange[1] < 10000 || searchTerm) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">
                {language === "ar" ? "الفلاتر النشطة:" : "Active filters:"}
              </span>

              {selectedCategories.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {language === "ar" ? "الفئة:" : "Category:"}
                  {categories.find(cat => cat._id === selectedCategories[0])?.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedCategories([])}
                  />
                </Badge>
              )}

              {statusFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {language === "ar" ? "الحالة:" : "Status:"}
                  {statusFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setStatusFilter("all")}
                  />
                </Badge>
              )}

              {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {language === "ar" ? "السعر:" : "Price:"}
                  {priceRange[0]} - {priceRange[1]} {language === "ar" ? "ج.م" : "EGP"}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setPriceRange([0, 10000])}
                  />
                </Badge>
              )}

              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {language === "ar" ? "بحث:" : "Search:"}
                  {searchTerm}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSearchTerm("")}
                  />
                </Badge>
              )}
            </div>
          )}

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {/* Filter Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              {/* Search Input */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={language === "ar" ? "البحث عن المنتجات..." : "Search products..."}
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap gap-2">
                {/* Category Filter */}
                <Select
                  value={selectedCategories.length > 0 ? selectedCategories[0] : "all"}
                  onValueChange={(value) => {
                    if (value === "all") {
                      setSelectedCategories([]);
                    } else {
                      setSelectedCategories([value]);
                    }
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={language === "ar" ? "الفئة" : "Category"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === "ar" ? "جميع الفئات" : "All Categories"}</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={language === "ar" ? "الحالة" : "Status"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === "ar" ? "جميع الحالات" : "All Statuses"}</SelectItem>
                    <SelectItem value="available">{language === "ar" ? "نشط" : "Active"}</SelectItem>
                    <SelectItem value="pending">{language === "ar" ? "قيد المراجعة" : "Pending"}</SelectItem>
                    <SelectItem value="draft">{language === "ar" ? "مسودة" : "Draft"}</SelectItem>
                  </SelectContent>
                </Select>



                {/* Sort Filter */}
                <Select
                  value={sortOption}
                  onValueChange={setSortOption}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={language === "ar" ? "ترتيب حسب" : "Sort By"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{language === "ar" ? "الأحدث" : "Newest"}</SelectItem>
                    <SelectItem value="priceHighToLow">{language === "ar" ? "السعر: من الأعلى" : "Price: High to Low"}</SelectItem>
                    <SelectItem value="priceLowToHigh">{language === "ar" ? "السعر: من الأدنى" : "Price: Low to High"}</SelectItem>
                    <SelectItem value="topRated">{language === "ar" ? "الأعلى تقييماً" : "Top Rated"}</SelectItem>
                    <SelectItem value="mostSold">{language === "ar" ? "الأكثر مبيعاً" : "Most Sold"}</SelectItem>
                  </SelectContent>
                </Select>

                {/* Clear Filters Button */}
                <Button
                  variant="outline"
                  onClick={clearProductFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  {language === "ar" ? "مسح الفلاتر" : "Clear Filters"}
                </Button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedCategories.length > 0 || statusFilter !== "all" || priceRange[0] > 0 || priceRange[1] < 10000 || searchTerm) && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground">
                  {language === "ar" ? "الفلاتر النشطة:" : "Active filters:"}
                </span>

                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {language === "ar" ? "الفئة:" : "Category:"}
                    {categories.find(cat => cat._id === selectedCategories[0])?.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedCategories([])}
                    />
                  </Badge>
                )}

                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {language === "ar" ? "الحالة:" : "Status:"}
                    {statusFilter}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setStatusFilter("all")}
                    />
                  </Badge>
                )}

                {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {language === "ar" ? "السعر:" : "Price:"}
                    {priceRange[0]} - {priceRange[1]} {language === "ar" ? "ج.م" : "EGP"}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setPriceRange([0, 10000])}
                    />
                  </Badge>
                )}

                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {language === "ar" ? "بحث:" : "Search:"}
                    {searchTerm}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSearchTerm("")}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">{language === "ar" ? "الصورة" : "Image"}</TableHead>
                      <TableHead className="min-w-[150px]">{language === "ar" ? "اسم المنتج" : "Product Name"}</TableHead>
                      <TableHead className="min-w-[80px]">{language === "ar" ? "السعر" : "Price"}</TableHead>
                      <TableHead className="min-w-[80px]">{language === "ar" ? "الخصم" : "Discount"}</TableHead>
                      <TableHead className="min-w-[80px]">{language === "ar" ? "السعر بعد الخصم" : "Discounted Price"}</TableHead>
                      <TableHead className="min-w-[80px]">{language === "ar" ? "المخزون" : "Stock"}</TableHead>
                      <TableHead className="min-w-[100px]">{language === "ar" ? "الحالة" : "Status"}</TableHead>
                      <TableHead className="min-w-[100px]">{language === "ar" ? "المراجعة" : "Approved"}</TableHead>
                      <TableHead className="min-w-[100px]">{language === "ar" ? "الفئة" : "Category"}</TableHead>
                      <TableHead className="min-w-[80px]">{language === "ar" ? "مباع" : "Sold"}</TableHead>
                      <TableHead className="min-w-[80px]">{language === "ar" ? "التقييم" : "Rating"}</TableHead>
                      <TableHead className="min-w-[80px]">{language === "ar" ? "عدد التقييمات" : "Rating Count"}</TableHead>
                      <TableHead className="min-w-[120px]">{language === "ar" ? "تاريخ الإنشاء" : "Created At"}</TableHead>
                      <TableHead className="text-right min-w-[120px]">{language === "ar" ? "الإجراءات" : "Actions"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="relative h-12 w-12 rounded-md overflow-hidden">
                            <Image
                              src={product.images[0] || "/placeholder.svg"}
                              alt={language === "ar" ? product.title : product.titleEn}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          {editingProductId === product._id ? (
                            <Input
                              value={editingProductData.title || ""}
                              onChange={(e) => setEditingProductData({
                                ...editingProductData,
                                title: e.target.value
                              })}
                              className="w-full"
                            />
                          ) : (
                            <div>
                              <p className="font-medium truncate max-w-[150px]">
                                {language === "ar" ? product.title : product.titleEn}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                ID: {product._id.slice(-6)}
                              </p>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingProductId === product._id ? (
                            <Input
                              type="number"
                              value={editingProductData.price || ""}
                              onChange={(e) => setEditingProductData({
                                ...editingProductData,
                                price: e.target.value
                              })}
                              className="w-full"
                            />
                          ) : (
                            <div className="flex flex-col">
                              <span className="font-medium">{product.price} {language === "ar" ? "ج.م" : "EGP"}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingProductId === product._id ? (
                            <Input
                              type="number"
                              value={editingProductData.discountPercentage || ""}
                              onChange={(e) => setEditingProductData({
                                ...editingProductData,
                                discountPercentage: e.target.value
                              })}
                              min="0"
                              max="100"
                              className="w-full"
                            />
                          ) : product.discountPercentage > 0 ? (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                              {product.discountPercentage}%
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.discountPercentage > 0 ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-green-600">
                                {product.discountedPrice} {language === "ar" ? "ج.م" : "EGP"}
                              </span>
                              <span className="text-xs line-through text-muted-foreground">
                                {product.price} {language === "ar" ? "ج.م" : "EGP"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingProductId === product._id ? (
                            <Input
                              type="number"
                              value={editingProductData.quantity || ""}
                              onChange={(e) => setEditingProductData({
                                ...editingProductData,
                                quantity: e.target.value
                              })}
                              min="0"
                              className="w-full"
                            />
                          ) : (
                            <div className="flex items-center gap-1">
                              {product.quantity}
                              {product.quantity < 10 && (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                                  {language === "ar" ? "منخفض" : "Low"}
                                </Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              product.status === "available"
                                ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200 flex items-center gap-1"
                                : "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 flex items-center gap-1"
                            }
                          >
                            {product.status === "available" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {language === "ar"
                              ? product.status === "available" ? "متاح" : " غيرمتاح"
                              : product.status}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              product.isApproved
                                ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200 flex items-center gap-1"
                                : "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 flex items-center gap-1"
                            }
                          >
                            {product.isApproved ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {language === "ar"
                              ? product.isApproved ? "تمت الموافقة" : "قيد المراجعة"
                              : product.isApproved}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {editingProductId === product._id ? (
                            <Select
                              value={editingProductData.category || (typeof product.category === "object" ? product.category._id : product.category)}
                              onValueChange={(value) =>
                                setEditingProductData({
                                  ...editingProductData,
                                  category: value,
                                })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat._id} value={cat._id}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline" className="bg-blue-50">
                              {typeof product.category === "object" ? product.category.name : product.category}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {product.sold}
                            {product.sold > 50 && (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {product?.ratings?.average.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {product?.ratings?.count}
                        </TableCell>
                        <TableCell>
                          {new Date(product.createdAt).toLocaleDateString(
                            language === "ar" ? 'ar-EG' : 'en-US',
                            { year: 'numeric', month: 'short', day: 'numeric' }
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingProductId === product._id ? (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingProductId(null);
                                  setEditingProductData({});
                                }}
                              >
                                {language === "ar" ? "إلغاء" : "Cancel"}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateProduct(product._id)}
                                disabled={updatingProductId === product._id}
                              >
                                {updatingProductId === product._id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-1" />
                                    {language === "ar" ? "حفظ" : "Save"}
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{language === "ar" ? "الإجراءات" : "Actions"}</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link href={`/products/${product._id}`} className="flex items-center cursor-pointer">
                                    <Eye className="h-4 w-4 mr-2" />
                                    {language === "ar" ? "عرض" : "View"}
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  {language === "ar" ? "تعديل" : "Edit"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDeleteProduct(product._id)}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  {language === "ar" ? "حذف" : "Delete"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {products.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {language === "ar" ? "لا توجد منتجات" : "No products found"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {language === "ar"
                      ? "لم تقم بإضافة أي منتجات بعد. ابدأ بإضافة منتجك الأول."
                      : "You haven't added any products yet. Start by adding your first product."}
                  </p>
                  <Button asChild>
                    <Link href="/vendor/dashboard/products/new">
                      <Plus className="h-4 w-4 mr-2" />
                      {language === "ar" ? "إضافة منتج جديد" : "Add New Product"}
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {language === "ar"
                  ? `عرض ${products.length} من ${totalProducts} منتج`
                  : `Showing ${products.length} of ${totalProducts} products`}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  {language === "ar" ? "السابق" : "Previous"}
                </Button>

                <span className="text-sm">
                  {language === "ar" ? `صفحة ${page}` : `Page ${page}`}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={products.length < pageSize}
                >
                  {language === "ar" ? "التالي" : "Next"}
                </Button>
              </div>
            </div>

            {/* No Products Message */}
            {products.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {language === "ar" ? "لا توجد منتجات" : "No products found"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === "ar"
                    ? "لم تقم بإضافة أي منتجات بعد أو لا توجد منتجات تطابق الفلاتر المحددة."
                    : "You haven't added any products yet or no products match the selected filters."}
                </p>
                <Button asChild>
                  <Link href="/vendor/dashboard/products/new">
                    <Plus className="h-4 w-4 mr-2" />
                    {language === "ar" ? "إضافة منتج جديد" : "Add New Product"}
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>


          {/* No Products Message */}
          {products.length === 0 && !loading && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {language === "ar" ? "لا توجد منتجات" : "No products found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === "ar"
                  ? "لم تقم بإضافة أي منتجات بعد أو لا توجد منتجات تطابق الفلاتر المحددة."
                  : "You haven't added any products yet or no products match the selected filters."}
              </p>
              <Button asChild>
                <Link href="/vendor/dashboard/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  {language === "ar" ? "إضافة منتج جديد" : "Add New Product"}
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Return Requests Tab */}
        <TabsContent value="returns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'طلبات الإرجاع' : 'Return Requests'}</CardTitle>
              <CardDescription>
                {language === 'ar'
                  ? 'تابع طلبات الإرجاع القادمة من العملاء وكيفية معالجتها'
                  : 'Track return requests coming from your customers and their progress'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={returnTab} onValueChange={setReturnTab} className="space-y-4">
                <TabsList className="flex flex-wrap gap-2 w-full">
                  {returnTabMeta.map((tab) => (
                    <TabsTrigger key={tab.key} value={tab.key} className="flex-1 min-w-[200px]">
                      <div className="flex flex-col text-left">
                        <span className="font-semibold flex items-center gap-2">
                          {tab.title}
                          <Badge variant="secondary">{tab.count}</Badge>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {tab.description}
                        </span>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={returnTab} className="mt-4">
                  {renderReturnTable(currentReturnList)}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={language === "ar" ? "البحث عن الطلبات..." : "Search orders..."}
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.deliveryStatus || 'all'}
                onValueChange={(value) => handleFilterChange('deliveryStatus', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={language === "ar" ? "الحالة" : "Status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "ar" ? "الكل" : "All"}</SelectItem>
                  <SelectItem value="pending">{language === "ar" ? "قيد الانتظار" : "Pending"}</SelectItem>
                  <SelectItem value="shipped">{language === "ar" ? "تم الشحن" : "Shipped"}</SelectItem>
                  <SelectItem value="delivered">{language === "ar" ? "تم التسليم" : "Delivered"}</SelectItem>
                  <SelectItem value="cancelled">{language === "ar" ? "ملغي" : "Cancelled"}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.isPrepared || 'all'}
                onValueChange={(value) => handleFilterChange('isPrepared', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={language === "ar" ? "حالة التجهيز" : "Preparation"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "ar" ? "الكل" : "All"}</SelectItem>
                  <SelectItem value="prepared">{language === "ar" ? "تم التجهيز" : "Prepared"}</SelectItem>
                  <SelectItem value="preparing">{language === "ar" ? "قيد التجهيز" : "Preparing"}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={setSortBy}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={language === "ar" ? "الترتيب" : "Sort"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{language === "ar" ? "الأحدث" : "Recent"}</SelectItem>
                  <SelectItem value="oldest">{language === "ar" ? "الأقدم" : "Oldest"}</SelectItem>
                  <SelectItem value="total-high">{language === "ar" ? "الأعلى سعراً" : "Highest Total"}</SelectItem>
                  <SelectItem value="total-low">{language === "ar" ? "الأقل سعراً" : "Lowest Total"}</SelectItem>
                </SelectContent>
              </Select>

              {(Object.keys(filters).length > 0 || searchTerm) && (
                <Button
                  variant="outline"
                  onClick={clearOrderFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  {language === "ar" ? "مسح الفلاتر" : "Clear Filters"}
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === "ar" ? "رقم الطلب" : "Order ID"}</TableHead>
                  <TableHead>{language === "ar" ? "التاريخ" : "Date"}</TableHead>
                  <TableHead>{language === "ar" ? "العناصر" : "Items"}</TableHead>
                  <TableHead>{language === "ar" ? "حالة التجهيز" : "Preparation Status"}</TableHead>
                  <TableHead>{language === "ar" ? "الحالة" : "Status"}</TableHead>
                  <TableHead className="text-right">{language === "ar" ? "الإجمالي" : "Total"}</TableHead>
                  <TableHead className="text-right">{language === "ar" ? "إجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">#{order.secretCode || order._id.slice(-6)}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString(language === "ar" ? 'ar-EG' : 'en-US')}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {order.formattedItems?.map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="relative h-10 w-10 rounded-md overflow-hidden">
                                <Image
                                  src={item.productImage}
                                  alt={item.productName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{item.productName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.quantity} × {item.price} {language === "ar" ? "ج.م" : "EGP"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.isPrepared ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {language === "ar" ? "تم التجهيز" : "Prepared"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            <Clock className="h-3 w-3 mr-1" />
                            {language === "ar" ? "قيد التجهيز" : "Preparing"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          order.deliveryStatus === "delivered" ? "success" :
                            order.deliveryStatus === "shipped" ? "default" : "outline"
                        }>
                          {language === "ar"
                            ? order.deliveryStatus === "delivered" ? "تم التسليم" :
                              order.deliveryStatus === "shipped" ? "تم الشحن" :
                                order.deliveryStatus === "cancelled" ? "ملغي" : "قيد الانتظار"
                            : order.deliveryStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {order.total} {language === "ar" ? "ج.م" : "EGP"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{language === "ar" ? "إجراءات" : "Actions"}</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              {language === "ar" ? "عرض التفاصيل" : "View Details"}
                            </DropdownMenuItem>

                            {!order.isPrepared && (
                              <DropdownMenuItem
                                onClick={() => handleConfirmPreparation(order._id)}
                                disabled={preparingOrderId === order._id}
                                className="text-green-600 focus:text-green-700"
                              >
                                {preparingOrderId === order._id ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {language === "ar" ? "جاري التجهيز..." : "Preparing..."}
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {language === "ar" ? "تم التجهيز" : "Mark as Prepared"}
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              {language === "ar" ? "تحديث الحالة" : "Update Status"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {language === "ar" ? "لا توجد طلبات تطابق معايير البحث" : "No orders match your search criteria"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>


      </Tabs>
    </div>
  )
}