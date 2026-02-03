// components/admin/ReturnsTab.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PaginationControls from "@/components/pagination-controls";
import { Loader2, Package, Check, X, Clock, RefreshCw, PackageCheck, ArrowRight, Trash2 } from "lucide-react";
import { useState } from "react";

interface ReturnsTabProps {
    returnRequests: any[];
    loadingReturns: boolean;
    errorReturns: string | null;
    isArabic: boolean;
    pagination: { currentPage: number; totalPages: number };
    onPageChange: (page: number) => void;
    handleApproveReturn: (returnId: string) => void;
    handleRejectReturn: (returnId: string) => void;
    handleProcessReturn: (returnId: string) => void;
    handleFinishedReturn: (returnId: string) => void;
    handleDeleteReturn: (returnId: string) => void;
    handleUpdateReturnStatus?: (returnId: string, status: string) => void;
    fetchReturnRequests?: () => Promise<any>;
}

export function ReturnsTab({
    returnRequests,
    loadingReturns,
    errorReturns,
    isArabic,
    pagination,
    onPageChange,
    handleApproveReturn,
    handleRejectReturn,
    handleProcessReturn,
    handleFinishedReturn,
    handleDeleteReturn,
    handleUpdateReturnStatus,
    fetchReturnRequests
}: ReturnsTabProps) {
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [statusLoading, setStatusLoading] = useState<string | null>(null);

    const handleDeleteClick = async (returnId: string) => {
        setDeleteLoading(returnId);
        try {
            //console.log(returnId, 'handleDeleteClick')
            await handleDeleteReturn(returnId);
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleStatusUpdate = async (returnId: string, status: string) => {
        setStatusLoading(returnId);
        try {
            if (handleUpdateReturnStatus) {
                await handleUpdateReturnStatus(returnId, status);
            } else {
                switch (status) {
                    case 'approved':
                        await handleApproveReturn(returnId);
                        break;
                    case 'rejected':
                        await handleRejectReturn(returnId);
                        break;
                    case 'processing':
                        await handleProcessReturn(returnId);
                        break;
                    case 'finished':
                        await handleFinishedReturn(returnId);
                        break;
                    default:
                        console.warn('Unknown status:', status);
                }
            }
        } finally {
            setStatusLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    variant: "secondary" as const,
                    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                    icon: <Clock className="h-3 w-3" />,
                    text: isArabic ? "قيد الانتظار" : "Pending"
                };
            case 'approved':
                return {
                    variant: "default" as const,
                    color: "bg-blue-100 text-blue-800 hover:bg-blue-100",
                    icon: <Check className="h-3 w-3" />,
                    text: isArabic ? "مقبول" : "Approved"
                };
            case 'processing':
                return {
                    variant: "default" as const,
                    color: "bg-purple-100 text-purple-800 hover:bg-purple-100",
                    icon: <RefreshCw className="h-3 w-3" />,
                    text: isArabic ? "قيد المعالجة" : "Processing"
                };
            case 'finished':
                return {
                    variant: "default" as const,
                    color: "bg-green-100 text-green-800 hover:bg-green-100",
                    icon: <PackageCheck className="h-3 w-3" />,
                    text: isArabic ? "مكتمل" : "Finished"
                };
            default:
                return {
                    variant: "secondary" as const,
                    color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
                    icon: <Clock className="h-3 w-3" />,
                    text: status
                };
        }
    };

    // Get the next status in sequence
    const getNextStatus = (currentStatus: string): string | null => {
        const statusSequence = ['pending', 'approved', 'processing', 'finished'];
        const currentIndex = statusSequence.indexOf(currentStatus);
        return currentIndex < statusSequence.length - 1 ? statusSequence[currentIndex + 1] : null;
    };

    // Get the previous status in sequence
    const getPreviousStatus = (currentStatus: string): string | null => {
        const statusSequence = ['pending', 'approved', 'processing', 'finished'];
        const currentIndex = statusSequence.indexOf(currentStatus);
        return currentIndex > 0 ? statusSequence[currentIndex - 1] : null;
    };

    // Get status progression buttons
    const getStatusProgressionButtons = (returnRequest: any) => {
        const { status, _id } = returnRequest;
        const nextStatus = getNextStatus(status);
        const prevStatus = getPreviousStatus(status);
        const isLoading = statusLoading === _id;

        const statusConfigs: { [key: string]: { label: string; labelAr: string; icon: JSX.Element; className: string } } = {
            pending: {
                label: "Approve",
                labelAr: "قبول",
                icon: <Check className="h-3 w-3 ml-1" />,
                className: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
            },
            approved: {
                label: "Start Processing",
                labelAr: "بدء المعالجة",
                icon: <RefreshCw className="h-3 w-3 ml-1" />,
                className: "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
            },
            processing: {
                label: "Finish Process",
                labelAr: "إنهاء العملية",
                icon: <PackageCheck className="h-3 w-3 ml-1" />,
                className: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
            }
        };

        return (
            <div className="flex flex-col gap-2">
                {/* Next Status Button */}
                {nextStatus && statusConfigs[status] && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(_id, nextStatus)}
                        className={statusConfigs[status].className}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <>
                                {statusConfigs[status].icon}
                                {isArabic ? statusConfigs[status].labelAr : statusConfigs[status].label}
                                <ArrowRight className="h-3 w-3 mr-1" />
                            </>
                        )}
                    </Button>
                )}

                {/* Previous Status Button */}
                {prevStatus && status !== 'finished' && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(_id, prevStatus)}
                        className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 text-xs"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            isArabic ? "رجوع" : "Back"
                        )}
                    </Button>
                )}

                {/* Reject Button - Available only for pending and approved statuses */}
                {(status === 'pending' || status === 'approved') && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(_id, 'rejected')}
                        className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 text-xs"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <>
                                <X className="h-3 w-3 ml-1" />
                                {isArabic ? "رفض" : "Reject"}
                            </>
                        )}
                    </Button>
                )}

                {/* Special case for rejected status */}
                {status === 'rejected' && (
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(_id, 'pending')}
                            className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 text-xs"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                isArabic ? "إعادة للانتظار" : "Set to Pending"
                            )}
                        </Button>
                    </div>
                )}

                {/* Finished status - show badge only */}
                {status === 'finished' && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {isArabic ? "مكتمل" : "Finished"}
                    </Badge>
                )}

                {/* Delete Button - Available for all statuses except when loading */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(_id)}
                    className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 text-xs"
                    disabled={deleteLoading === _id || isLoading}
                >
                    {deleteLoading === _id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <Trash2 className="h-3 w-3 ml-1" />
                    )}
                    {isArabic ? "حذف" : "Delete"}
                </Button>
            </div>
        );
    };

    // Quick status filter buttons - only the four main statuses
    const statusFilters = [
        { value: 'all', label: isArabic ? 'الكل' : 'All', count: returnRequests.length },
        { value: 'pending', label: isArabic ? 'قيد الانتظار' : 'Pending', count: returnRequests.filter(r => r.status === 'pending').length },
        { value: 'approved', label: isArabic ? 'مقبول' : 'Approved', count: returnRequests.filter(r => r.status === 'approved').length },
        { value: 'processing', label: isArabic ? 'قيد المعالجة' : 'Processing', count: returnRequests.filter(r => r.status === 'processing').length },
        { value: 'finished', label: isArabic ? 'مكتمل' : 'Finished', count: returnRequests.filter(r => r.status === 'finished').length },
    ];

    const [activeFilter, setActiveFilter] = useState('all');

    const filteredRequests = activeFilter === 'all'
        ? returnRequests
        : returnRequests.filter(request => request.status === activeFilter);

    return (
        <div className="space-y-6">
            {/* Status Filter Buttons */}
            <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                    <Button
                        key={filter.value}
                        variant={activeFilter === filter.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter(filter.value)}
                        className="relative"
                    >
                        {filter.label}
                        <Badge
                            variant="secondary"
                            className="ml-2 bg-primary text-primary-foreground"
                        >
                            {filter.count}
                        </Badge>
                    </Button>
                ))}
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">{isArabic ? "المعرف" : "ID"}</TableHead>
                            <TableHead>{isArabic ? "المستخدم" : "User"}</TableHead>
                            <TableHead>{isArabic ? "الطلب" : "Order"}</TableHead>
                            <TableHead>{isArabic ? "المنتج" : "Product"}</TableHead>
                            <TableHead>{isArabic ? "السبب" : "Reason"}</TableHead>
                            <TableHead>{isArabic ? "الصور" : "Images"}</TableHead>
                            <TableHead>{isArabic ? "البائع" : "Seller"}</TableHead>
                            <TableHead className="w-[130px]">{isArabic ? "الحالة" : "Status"}</TableHead>
                            <TableHead className="w-[220px]">{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                            <TableHead className="w-[120px]">{isArabic ? "تاريخ الطلب" : "Request Date"}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadingReturns ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center">
                                    <div className="flex justify-center items-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : errorReturns ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center text-destructive py-8">
                                    {errorReturns}
                                </TableCell>
                            </TableRow>
                        ) : filteredRequests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8">
                                    <div className="flex flex-col items-center">
                                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            {isArabic
                                                ? `لا توجد طلبات إرجاع ${activeFilter !== 'all' ? `بحالة ${statusFilters.find(f => f.value === activeFilter)?.label}` : ''}`
                                                : `No return requests ${activeFilter !== 'all' ? `with ${activeFilter} status` : ''} found`
                                            }
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRequests.map((request: any) => {
                                const statusBadge = getStatusBadge(request.status);

                                return (
                                    <TableRow key={request._id}>
                                        <TableCell className="font-medium">
                                            #{request._id.slice(-6)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{request.username}</div>
                                                <div className="text-sm text-muted-foreground">{request.email}</div>
                                                <div className="text-sm text-muted-foreground">{request.phone}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {request.order ? `#${request.order._id || 'N/A'}` : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {request.product ? (
                                                <div>
                                                    <div className="font-medium">{request.product.title}</div>
                                                    {request.product.price && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {request.product.price} {isArabic ? "ج.م" : "EGP"}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : 'N/A'}
                                        </TableCell>
                                        <TableCell className="max-w-[200px]">
                                            <div className="line-clamp-2" title={request.reason}>
                                                {request.reason}
                                            </div>
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
                                            {request.seller ?

                                                <div className="space-y-1">
                                                    <div className="font-medium">{request.seller.firstName}{request.seller.lastName}</div>
                                                    <div className="text-sm text-muted-foreground">{request.seller.email}</div>
                                                    <div className="text-sm text-muted-foreground">{request.seller.phone}</div>
                                                </div> : "Unknown"
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={statusBadge.variant}
                                                className={`${statusBadge.color} flex items-center gap-1 w-fit`}
                                            >
                                                {statusBadge.icon}
                                                <span>{statusBadge.text}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusProgressionButtons(request)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {new Date(request.createdAt).toLocaleDateString()}
                                                <div className="text-muted-foreground text-xs">
                                                    {new Date(request.createdAt).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Summary Stats - Only the four main statuses */}
            {!loadingReturns && returnRequests.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 text-sm">
                    <div className="bg-yellow-50 p-3 rounded-lg border">
                        <div className="font-medium text-yellow-700">{isArabic ? "قيد الانتظار" : "Pending"}</div>
                        <div className="text-xl font-bold text-yellow-800">
                            {returnRequests.filter(r => r.status === 'pending').length}
                        </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border">
                        <div className="font-medium text-blue-700">{isArabic ? "مقبول" : "Approved"}</div>
                        <div className="text-xl font-bold text-blue-800">
                            {returnRequests.filter(r => r.status === 'approved').length}
                        </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg border">
                        <div className="font-medium text-purple-700">{isArabic ? "قيد المعالجة" : "Processing"}</div>
                        <div className="text-xl font-bold text-purple-800">
                            {returnRequests.filter(r => r.status === 'processing').length}
                        </div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg border">
                        <div className="font-medium text-green-800">{isArabic ? "مكتمل" : "Finished"}</div>
                        <div className="text-xl font-bold text-green-900">
                            {returnRequests.filter(r => r.status === 'finished').length}
                        </div>
                    </div>
                </div>
            )}
        {/* Pagination */}
            {returnRequests.length > 0 && (
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