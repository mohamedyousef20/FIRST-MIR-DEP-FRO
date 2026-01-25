"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { complaintService } from "@/lib/api"
import { toast } from "react-hot-toast"
import {
    PlusCircle,
    Eye,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    Filter,
    Calendar,
    User,
    Package,
    MessageSquare,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Download
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MirvoryPageLoader } from "@/components/MirvoryLoader"

interface Complaint {
    _id: string
    title: string
    message: string
    status: 'pending' | 'in_progress' | 'resolved' | 'cancelled'
    priority?: 'low' | 'medium' | 'high' | 'critical'
    images: string[]
    order?: {
        _id: string
        orderNumber: string
    }
    user: {
        _id: string
        firstName: string
        lastName: string
        email: string
    }
    createdAt: string
    updatedAt: string
    resolvedAt?: string
    adminReplies?: Array<{
        user: {
            firstName: string
            lastName: string
            role: string
        }
        message: string
        createdAt: string
    }>
}

export default function ComplaintsListPage() {
    const router = useRouter()

    const [complaints, setComplaints] = useState<Complaint[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalComplaints, setTotalComplaints] = useState(0)

    const statusColors = {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        in_progress: "bg-blue-100 text-blue-800 border-blue-200",
        resolved: "bg-green-100 text-green-800 border-green-200",
        cancelled: "bg-red-100 text-red-800 border-red-200"
    }

    const priorityColors = {
        low: "bg-gray-100 text-gray-800",
        medium: "bg-blue-100 text-blue-800",
        high: "bg-orange-100 text-orange-800",
        critical: "bg-red-100 text-red-800"
    }

    useEffect(() => {
        fetchComplaints()
    }, [currentPage, statusFilter])

    const fetchComplaints = async () => {
        try {
            setLoading(true)
            const params = {
                page: currentPage,
                limit: 10,
                status: statusFilter !== "all" ? statusFilter : undefined,
                search: search || undefined
            }

            const response = await complaintService.getMyComplaints(params)

            // تعديل بناء على استجابة الباكند
            const data = response.data?.data || response.data || []
            const pagination = response.data?.pagination || response.data?.meta || {}

            setComplaints(Array.isArray(data) ? data : [])
            setTotalPages(pagination.pages || pagination.totalPages || 1)
            setTotalComplaints(pagination.total || data.length || 0)
        } catch (error: any) {
            console.error("خطأ في جلب الشكاوى:", error)

            let errorMessage = "فشل في تحميل الشكاوى"

            if (error.response?.status === 401) {
                errorMessage = "يجب تسجيل الدخول لعرض الشكاوى"
                router.push("/auth/login")
            }

            toast.error(
                <div className="text-right">
                    <p className="font-bold">خطأ في التحميل</p>
                    <p className="text-gray-600 mt-1">{errorMessage}</p>
                </div>,
                {
                    duration: 4000,
                    icon: "❌"
                }
            )
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setCurrentPage(1)
        fetchComplaints()
    }

    const handleRefresh = () => {
        fetchComplaints()
        toast.success("تم تحديث البيانات", {
            icon: "🔄",
            duration: 2000
        })
    }

    const handleViewDetails = (complaint: Complaint) => {
        setSelectedComplaint(complaint)
        setShowModal(true)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ar-SA", {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4" />
            case 'in_progress': return <AlertCircle className="h-4 w-4" />
            case 'resolved': return <CheckCircle className="h-4 w-4" />
            case 'cancelled': return <XCircle className="h-4 w-4" />
            default: return <FileText className="h-4 w-4" />
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return "قيد الانتظار"
            case 'in_progress': return "قيد المعالجة"
            case 'resolved': return "تم الحل"
            case 'cancelled': return "ملغي"
            default: return status
        }
    }

    const getPriorityText = (priority?: string) => {
        switch (priority) {
            case 'low': return "منخفض"
            case 'medium': return "متوسط"
            case 'high': return "عالي"
            case 'critical': return "حرج"
            default: return "غير محدد"
        }
    }

    const downloadComplaint = (complaint: Complaint) => {
        const content = `
      شكوى رقم: ${complaint._id}
      العنوان: ${complaint.title}
      الحالة: ${getStatusText(complaint.status)}
      الأولوية: ${getPriorityText(complaint.priority)}
      تاريخ الإنشاء: ${formatDate(complaint.createdAt)}
      آخر تحديث: ${formatDate(complaint.updatedAt)}
      ${complaint.resolvedAt ? `تاريخ الحل: ${formatDate(complaint.resolvedAt)}` : ''}
      
      تفاصيل الشكوى:
      ${complaint.message}
      
      ${complaint.order ? `الطلب المرتبط: #${complaint.order.orderNumber}` : ''}
      
      ${complaint.adminReplies?.length ? `
      ردود الإدارة:
      ${complaint.adminReplies.map((reply, idx) => `
      ${idx + 1}. ${reply.user.firstName} ${reply.user.lastName} (${reply.user.role})
         التاريخ: ${formatDate(reply.createdAt)}
         الرد: ${reply.message}
      `).join('\n')}
      ` : ''}
    `

        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `شكوى-${complaint._id.slice(-8)}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success("تم تحميل الشكوى", {
            icon: "📥",
            duration: 3000
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8" dir="rtl">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* العنوان الرئيسي */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                                الشكاوى المقدمة
                            </h1>
                            <p className="text-gray-600 mt-2">
                                عرض ومتابعة جميع الشكاوى التي قمت بتقديمها
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => router.push("/complaints/new")}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg"
                            >
                                <PlusCircle className="h-5 w-5" />
                                تقديم شكوى جديدة
                            </button>

                            <button
                                onClick={handleRefresh}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold border border-blue-200"
                            >
                                <RefreshCw className="h-5 w-5" />
                                تحديث
                            </button>
                        </div>
                    </div>

                    {/* الإحصائيات */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">إجمالي الشكاوى</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalComplaints}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <FileText className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-yellow-100 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">قيد الانتظار</p>
                                    <p className="text-3xl font-bold text-yellow-600 mt-2">
                                        {complaints.filter(c => c.status === 'pending').length}
                                    </p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-xl">
                                    <Clock className="h-8 w-8 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">قيد المعالجة</p>
                                    <p className="text-3xl font-bold text-blue-600 mt-2">
                                        {complaints.filter(c => c.status === 'in_progress').length}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <AlertCircle className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">تم الحل</p>
                                    <p className="text-3xl font-bold text-green-600 mt-2">
                                        {complaints.filter(c => c.status === 'resolved').length}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* البحث والتصفية */}
                    <div className="bg-white rounded-2xl p-6 border shadow-sm mb-8">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="ابحث في الشكاوى حسب العنوان أو المحتوى..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <div className="relative">
                                        <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value)
                                                setCurrentPage(1)
                                            }}
                                            className="pr-12 pl-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 appearance-none min-w-[180px]"
                                        >
                                            <option value="all">جميع الحالات</option>
                                            <option value="pending">قيد الانتظار</option>
                                            <option value="in_progress">قيد المعالجة</option>
                                            <option value="resolved">تم الحل</option>
                                            <option value="cancelled">ملغي</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        بحث
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* جدول الشكاوى */}
                <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                    {loading ? (
                        <MirvoryPageLoader text={" جاري تحميل الشكاوى....."} />

                    ) : complaints.length === 0 ? (
                        <div className="text-center p-12">
                            <FileText className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                {search || statusFilter !== "all" ? "لا توجد شكاوى تطابق معايير البحث" : "لم تقم بتقديم أي شكاوى بعد"}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {search || statusFilter !== "all"
                                    ? "حاول تعديل كلمات البحث أو إزالة الفلاتر"
                                    : "يمكنك البدء بتقديم شكوى جديدة بالنقر على الزر أدناه"}
                            </p>
                            <button
                                onClick={() => router.push("/complaints/new")}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                            >
                                <PlusCircle className="h-5 w-5" />
                                تقديم شكوى جديدة
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                                العنوان
                                            </th>
                                            <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                                الحالة
                                            </th>
                                            <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                                الطلب
                                            </th>
                                            <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                                التاريخ
                                            </th>
                                            <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                                الإجراءات
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {complaints.map((complaint) => (
                                            <tr
                                                key={complaint._id}
                                                className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                                onClick={() => handleViewDetails(complaint)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="space-y-2">
                                                        <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                            {complaint.title}
                                                        </div>
                                                        <div className="text-sm text-gray-500 line-clamp-2">
                                                            {complaint.message.substring(0, 120)}...
                                                        </div>
                                                        {complaint.images && complaint.images.length > 0 && (
                                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                                <ImageIcon className="h-3 w-3" />
                                                                <span>{complaint.images.length} صورة</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-2">
                                                        <span className={cn(
                                                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border",
                                                            statusColors[complaint.status]
                                                        )}>
                                                            {getStatusIcon(complaint.status)}
                                                            {getStatusText(complaint.status)}
                                                        </span>
                                                        {complaint.priority && (
                                                            <span className={cn(
                                                                "inline-flex px-3 py-1 rounded-full text-xs font-medium",
                                                                priorityColors[complaint.priority]
                                                            )}>
                                                                {getPriorityText(complaint.priority)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {complaint.order ? (
                                                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                                                            <Package className="h-4 w-4 text-blue-600" />
                                                            <span className="font-medium text-blue-900">
                                                                #{complaint.order.orderNumber}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-gray-900">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            {formatDate(complaint.createdAt)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            آخر تحديث: {formatDate(complaint.updatedAt)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleViewDetails(complaint)
                                                            }}
                                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            عرض
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                downloadComplaint(complaint)
                                                            }}
                                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* الترقيم */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                                    <div className="text-sm text-gray-700">
                                        عرض <span className="font-semibold">{(currentPage - 1) * 10 + 1}</span> إلى{" "}
                                        <span className="font-semibold">
                                            {Math.min(currentPage * 10, totalComplaints)}
                                        </span>{" "}
                                        من <span className="font-semibold">{totalComplaints}</span> شكوى
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className={cn(
                                                "p-2 rounded-lg border transition-colors",
                                                currentPage === 1
                                                    ? "text-gray-400 cursor-not-allowed"
                                                    : "text-gray-700 hover:bg-gray-100"
                                            )}
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>

                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum
                                            if (totalPages <= 5) {
                                                pageNum = i + 1
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i
                                            } else {
                                                pageNum = currentPage - 2 + i
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={cn(
                                                        "w-10 h-10 rounded-lg border font-medium transition-colors",
                                                        currentPage === pageNum
                                                            ? "bg-blue-600 text-white border-blue-600"
                                                            : "text-gray-700 hover:bg-gray-100"
                                                    )}
                                                >
                                                    {pageNum}
                                                </button>
                                            )
                                        })}

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className={cn(
                                                "p-2 rounded-lg border transition-colors",
                                                currentPage === totalPages
                                                    ? "text-gray-400 cursor-not-allowed"
                                                    : "text-gray-700 hover:bg-gray-100"
                                            )}
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* نافذة تفاصيل الشكوى */}
            {showModal && selectedComplaint && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* رأس النافذة */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FileText className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            تفاصيل الشكوى
                                        </h3>
                                        <p className="text-gray-500 text-sm">
                                            رقم الشكوى: {selectedComplaint._id.slice(-8)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XCircle className="h-6 w-6 text-gray-400" />
                                </button>
                            </div>

                            {/* محتوى الشكوى */}
                            <div className="space-y-6">
                                {/* معلومات أساسية */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <label className="block text-sm font-medium text-gray-500 mb-2">
                                            العنوان
                                        </label>
                                        <p className="font-semibold text-gray-900">{selectedComplaint.title}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <label className="block text-sm font-medium text-gray-500 mb-2">
                                            الحالة
                                        </label>
                                        <span className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border",
                                            statusColors[selectedComplaint.status]
                                        )}>
                                            {getStatusIcon(selectedComplaint.status)}
                                            {getStatusText(selectedComplaint.status)}
                                        </span>
                                    </div>

                                    {selectedComplaint.priority && (
                                        <div className="bg-gray-50 p-4 rounded-xl">
                                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                                الأولوية
                                            </label>
                                            <span className={cn(
                                                "inline-flex px-3 py-1.5 rounded-lg text-sm font-medium",
                                                priorityColors[selectedComplaint.priority]
                                            )}>
                                                {getPriorityText(selectedComplaint.priority)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <label className="block text-sm font-medium text-gray-500 mb-2">
                                            تاريخ الإنشاء
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-900">{formatDate(selectedComplaint.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <label className="block text-sm font-medium text-gray-500 mb-2">
                                            آخر تحديث
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-900">{formatDate(selectedComplaint.updatedAt)}</span>
                                        </div>
                                    </div>

                                    {selectedComplaint.resolvedAt && (
                                        <div className="bg-gray-50 p-4 rounded-xl">
                                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                                تاريخ الحل
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-gray-900">{formatDate(selectedComplaint.resolvedAt)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* الطلب المرتبط */}
                                {selectedComplaint.order && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <label className="block text-sm font-medium text-blue-700 mb-2">
                                            الطلب المرتبط
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <Package className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="font-semibold text-blue-900">
                                                    الطلب #{selectedComplaint.order.orderNumber}
                                                </p>
                                                <p className="text-blue-700 text-sm">
                                                    يمكنك <a href={`/orders/${selectedComplaint.order._id}`} className="underline hover:text-blue-900">مشاهدة تفاصيل الطلب</a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* تفاصيل الشكوى */}
                                <div>
                                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                                        تفاصيل الشكوى
                                    </label>
                                    <div className="bg-gray-50 rounded-xl p-5">
                                        <p className="text-gray-900 whitespace-pre-line leading-relaxed">
                                            {selectedComplaint.message}
                                        </p>
                                    </div>
                                </div>

                                {/* المرفقات */}
                                {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-900 mb-3">
                                            المرفقات ({selectedComplaint.images.length})
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {selectedComplaint.images.map((image, index) => (
                                                <div key={index} className="relative group">
                                                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                                                        <img
                                                            src={image}
                                                            alt={`مرفق ${index + 1}`}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                                                            onClick={() => window.open(image, '_blank')}
                                                        />
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-2 px-3 text-center">
                                                        صورة {index + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ردود الإدارة */}
                                {selectedComplaint.adminReplies && selectedComplaint.adminReplies.length > 0 ? (
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-900 mb-3">
                                            ردود الإدارة ({selectedComplaint.adminReplies.length})
                                        </label>
                                        <div className="space-y-4">
                                            {selectedComplaint.adminReplies.map((reply, index) => (
                                                <div key={index} className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                                <User className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-blue-900">
                                                                    {reply.user.firstName} {reply.user.lastName}
                                                                </p>
                                                                <p className="text-blue-700 text-sm">{reply.user.role}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-blue-600">
                                                            {formatDate(reply.createdAt)}
                                                        </div>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-4">
                                                        <p className="text-gray-900">{reply.message}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="h-6 w-6 text-yellow-600" />
                                            <div>
                                                <p className="font-semibold text-yellow-900">لم يتم الرد بعد</p>
                                                <p className="text-yellow-700 text-sm mt-1">
                                                    سيتم الرد على شكواك من قبل فريق الدعم في أقرب وقت ممكن.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* تذييل النافذة */}
                            <div className="flex justify-between items-center mt-8 pt-6 border-t">
                                <button
                                    onClick={() => downloadComplaint(selectedComplaint)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                                >
                                    <Download className="h-5 w-5" />
                                    تحميل الشكوى
                                </button>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                                    >
                                        إغلاق
                                    </button>
                                    {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'cancelled' && (
                                        <button
                                            onClick={() => {
                                                router.push(`/complaints/${selectedComplaint._id}/follow-up`)
                                                setShowModal(false)
                                            }}
                                            className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors font-medium"
                                        >
                                            <MessageSquare className="h-5 w-5 inline ml-2" />
                                            متابعة الشكوى
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}