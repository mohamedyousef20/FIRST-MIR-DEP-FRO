"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner"
import { format } from 'date-fns';
import { returnService } from '@/lib/api';
import { MirvoryPageLoader } from '@/components/MirvoryLoader';
import { Plus, ExternalLink, ChevronRight } from 'lucide-react';

interface ReturnItem {
    _id: string;
    product: {
        _id: string;
        name: string;
        images: string;
    };
    quantity: number;
    price: number;
}

interface ReturnRequest {
    _id: string;
    user: string;
    username: string;
    email: string;
    phone: string;
    order: string;
    product: {
        _id: string;
        name: string;
        images: string;
    };
    seller: string;
    reason: string;
    item: string;
    status: 'pending' | 'approved' | 'processing' | 'ready_for_pickup' | 'received' | 'rejected' | 'finished';
    deleteAt?: string;
    createdAt: string;
    updatedAt: string;
}

export default function ReturnsPage() {
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchReturns = async () => {
            try {
                const response = await returnService.getReturnRequests();
                //console.log(response.data, 'response of returns data');

                if (response?.data) {
                    setReturns(response.data);
                    //console.log('Returns set to state:', response.data);
                } else {
                    console.error('No data found in response:', response);
                    toast.error('حدث خطأ أثناء جلب طلبات الإرجاع');
                }
            } catch (error: any) {
                console.error('Error fetching returns:', error);
                toast.error(error instanceof Error ? error.message : 'فشل في تحميل طلبات الإرجاع');
            } finally {
                setLoading(false);
            }
        };

        fetchReturns();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'processing':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'ready_for_pickup':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'received':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'finished':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'قيد المراجعة';
            case 'approved':
                return 'تم الموافقة';
            case 'processing':
                return 'قيد المعالجة';
            case 'ready_for_pickup':
                return 'جاهز للاستلام';
            case 'received':
                return 'تم الاستلام';
            case 'rejected':
                return 'مرفوض';
            case 'finished':
                return 'مكتمل';
            default:
                return status;
        }
    };

    const handleDeleteReturn = async (returnId: string) => {
        if (!confirm('هل أنت متأكد من حذف طلب الإرجاع هذا؟')) return;

        try {
            await returnService.deleteReturnRequest(returnId);
            setReturns(returns.filter(r => r._id !== returnId));
            toast.success('تم حذف طلب الإرجاع بنجاح');
        } catch (error: any) {
            console.error('Error deleting return:', error);
            toast.error('فشل في حذف طلب الإرجاع');
        }
    };

    const handleNewReturnRequest = () => {
        router.push('/returns/new');
    };

    const handleViewReturnDetails = (returnId: string) => {
        router.push(`/returns/${returnId}`);
    };

    if (loading) {
        return <MirvoryPageLoader text={"جاري تحميل طلبات الإرجاع..."} />
    }

    if (returns.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
                <div className="w-24 h-24 mb-4 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M20 12H4m0 0l6-6m-6 6l6 6" />
                    </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">لا توجد طلبات إرجاع</h2>
                <p className="text-gray-600 mb-6">لم تقم بإنشاء أي طلبات إرجاع حتى الآن</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => router.push('/orders')}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        عرض الطلبات
                    </button>
                    <button
                        onClick={handleNewReturnRequest}
                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        طلب إرجاع جديد
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">طلبات الإرجاع الخاصة بك</h1>
                    <p className="text-gray-600">إدارة جميع طلبات الإرجاع الخاصة بك في مكان واحد</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
                    <button
                        onClick={() => router.push('/orders')}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        العودة إلى الطلبات
                    </button>
                    <button
                        onClick={handleNewReturnRequest}
                        className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        طلب إرجاع جديد
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                {returns.map((returnRequest) => (
                    <div key={returnRequest._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div>
                                        <p className="text-sm text-gray-500">طلب إرجاع #{returnRequest._id.slice(-6).toUpperCase()}</p>
                                        <p className="text-sm text-gray-500">
                                            الطلب الأصلي: #{returnRequest.order.slice(-6)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(returnRequest.status)}`}>
                                            {getStatusText(returnRequest.status)}
                                        </span>
                                        {returnRequest.status === 'finished' && returnRequest.deleteAt && (
                                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                                سينتهي بعد {format(new Date(returnRequest.deleteAt), 'yyyy/MM/dd')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    <p>أنشئ في: {format(new Date(returnRequest.createdAt), 'yyyy/MM/dd - hh:mm a')}</p>
                                    <p>آخر تحديث: {format(new Date(returnRequest.updatedAt), 'yyyy/MM/dd - hh:mm a')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Product Information */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">معلومات المنتج</h3>
                                    <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-20 h-20 bg-white rounded-md overflow-hidden border flex-shrink-0">
                                            <img
                                                src={returnRequest.product.images || '/placeholder-product.jpg'}
                                                alt={returnRequest.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{returnRequest.product.name}</h4>
                                            <p className="text-sm text-gray-600 mt-2">
                                                <span className="font-medium">رقم المنتج:</span> {returnRequest.product._id.slice(-6).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Return Details */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">تفاصيل الإرجاع</h3>
                                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <span className="font-medium text-sm text-gray-700">سبب الإرجاع:</span>
                                            <p className="text-sm text-gray-600 mt-1">{returnRequest.reason}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">رقم العنصر:</span>
                                                <p className="text-gray-600">{returnRequest.item.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>للمساعدة، يرجى التواصل مع خدمة العملاء</span>
                                </div>
                                <div className="flex gap-3">
                                    {/* View Details Button */}
                                    <button
                                        onClick={() => handleViewReturnDetails(returnRequest._id)}
                                        className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                                    >
                                        <span>عرض التفاصيل</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </button>

                                    {/* Delete Button (only for certain statuses) */}
                                    {(returnRequest.status === 'pending' || returnRequest.status === 'approved') && (
                                        <button
                                            onClick={() => handleDeleteReturn(returnRequest._id)}
                                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                        >
                                            حذف الطلب
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Navigation Card */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">هل تحتاج إلى مساعدة؟</h3>
                        <p className="text-sm text-gray-600">تصفح مركز المساعدة أو تواصل مع خدمة العملاء</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push('/help')}
                            className="px-4 py-2 text-sm bg-white text-primary border border-primary rounded-md hover:bg-primary/5 transition-colors flex items-center gap-2"
                        >
                            مركز المساعدة
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => router.push('/contact')}
                            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                        >
                            اتصل بنا
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}