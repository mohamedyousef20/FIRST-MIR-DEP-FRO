import { MirvoryPageLoader } from "@/components/MirvoryLoader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Calendar, Percent, DollarSign, Edit, Trash2, MoreHorizontal, Eye } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxDiscountAmount?: number;
    minPurchaseAmount: number;
    validFrom: string;
    validUntil: string;
    maxUses: number;
    currentUses: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface CouponsTabProps {
    [key: string]: unknown;
    coupons: Coupon[];
    isArabic: boolean;
    loading?: boolean;
    error?: string | null;
    language?: string;
    onEdit?: (coupon: Coupon) => void;
    handleDeleteCoupon?: (couponId: string) => void;
    onToggleStatus?: (couponId: string, isActive: boolean) => void;
    onView?: (coupon: Coupon) => void;
}

export function CouponsTab({
    coupons,
    isArabic,
    loading = false,
    error = null,
    language = "en",
    onEdit,
    handleDeleteCoupon,
    onToggleStatus,
    onView
}: CouponsTabProps) {
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch {
            return 'N/A';
        }
    };

    const handleEdit = (coupon: Coupon) => {
        if (onEdit) {
            onEdit(coupon);
        }
    };

    const handleDelete = (couponId: string) => {
        if (handleDeleteCoupon) {
            handleDeleteCoupon(couponId);
        }
    };

    const handleToggleStatus = (couponId: string, currentStatus: boolean) => {
        if (onToggleStatus) {
            onToggleStatus(couponId, !currentStatus);
        }
    };

    const handleView = (coupon: Coupon) => {
        if (onView) {
            onView(coupon);
        }
    };

    const isExpired = (validUntil: string) => {
        return new Date(validUntil) < new Date();
    };

    const isNotStarted = (validFrom: string) => {
        return new Date(validFrom) > new Date();
    };

    const getStatusBadge = (coupon: Coupon) => {
        if (!coupon.isActive) {
            return {
                variant: "destructive" as const,
                text: isArabic ? "غير نشط" : "Inactive",
                className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            };
        }

        if (isExpired(coupon.validUntil)) {
            return {
                variant: "destructive" as const,
                text: isArabic ? "منتهي" : "Expired",
                className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
            };
        }

        if (isNotStarted(coupon.validFrom)) {
            return {
                variant: "secondary" as const,
                text: isArabic ? "قادم" : "Upcoming",
                className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            };
        }

        if (coupon.currentUses >= coupon.maxUses) {
            return {
                variant: "destructive" as const,
                text: isArabic ? "مستنفذ" : "Used Up",
                className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
            };
        }

        return {
            variant: "default" as const,
            text: isArabic ? "نشط" : "Active",
            className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
        };
    };

    // Show loading state
    if (loading) {
        return <MirvoryPageLoader text={language === "ar" ? "جاري التحميل..." : "Loading..."} />;
    }

    // Show error state
    if (error) {
        return (
            <div className="text-center py-8 text-destructive">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{isArabic ? "كوبونات الخصم" : "Discount Coupons"}</h2>
                <Badge variant="secondary">
                    {coupons.length} {isArabic ? "كوبون" : "coupons"}
                </Badge>
                <Button asChild>
                    <Link href="/admin/coupons/new">
                        {isArabic ? "إضافة كوبون" : "Add Coupon"}
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">{isArabic ? "الكود" : "Code"}</TableHead>
                            <TableHead>{isArabic ? "نوع الخصم" : "Discount Type"}</TableHead>
                            <TableHead>{isArabic ? "قيمة الخصم" : "Discount Value"}</TableHead>
                            <TableHead>{isArabic ? "الحد الأدنى" : "Min Purchase"}</TableHead>
                            <TableHead>{isArabic ? "الفترة" : "Validity Period"}</TableHead>
                            <TableHead>{isArabic ? "الاستخدام" : "Usage"}</TableHead>
                            <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                            <TableHead className="w-[100px] text-center">{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {coupons && coupons.length > 0 ? (
                            coupons.map((coupon: Coupon) => {
                                const statusBadge = getStatusBadge(coupon);
                                const expired = isExpired(coupon.validUntil);
                                const notStarted = isNotStarted(coupon.validFrom);

                                return (
                                    <TableRow key={coupon._id} className={expired ? "opacity-60" : ""}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-lg">{coupon.code}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(coupon.createdAt)}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center">
                                                {coupon.discountType === "percentage" ? (
                                                    <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
                                                ) : (
                                                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                                                )}
                                                {coupon.discountType === "percentage"
                                                    ? (isArabic ? "نسبة مئوية" : "Percentage")
                                                    : (isArabic ? "قيمة ثابتة" : "Fixed Amount")}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {coupon.discountType === "percentage"
                                                        ? `${coupon.discountValue}%`
                                                        : `$${coupon.discountValue?.toFixed(2)}`}
                                                </span>
                                                {coupon.maxDiscountAmount && coupon.discountType === "percentage" && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {isArabic ? "بحد أقصى" : "Max"} ${coupon.maxDiscountAmount.toFixed(2)}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            ${coupon.minPurchaseAmount?.toFixed(2) || "0.00"}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center text-sm">
                                                    <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                                    {formatDate(coupon.validFrom)}
                                                </div>
                                                <div className="flex items-center text-sm">
                                                    <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                                    {formatDate(coupon.validUntil)}
                                                </div>
                                                {notStarted && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {isArabic ? "قادم" : "Upcoming"}
                                                    </Badge>
                                                )}
                                                {expired && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {isArabic ? "منتهي" : "Expired"}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {coupon.currentUses} / {coupon.maxUses || "∞"}
                                                </span>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                                    <div
                                                        className="bg-blue-600 h-1.5 rounded-full"
                                                        style={{
                                                            width: `${Math.min((coupon.currentUses / coupon.maxUses) * 100, 100)}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant={statusBadge.variant}
                                                className={statusBadge.className}
                                            >
                                                {statusBadge.text}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleView(coupon)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        {isArabic ? "عرض" : "View"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEdit(coupon)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        {isArabic ? "تعديل" : "Edit"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(coupon._id, coupon.isActive)}
                                                        className={coupon.isActive ? "text-orange-600" : "text-green-600"}
                                                    >
                                                        {coupon.isActive ? (
                                                            <>
                                                                <span>🚫</span>
                                                                <span className="mr-2">{isArabic ? "إلغاء التفعيل" : "Deactivate"}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>✅</span>
                                                                <span className="mr-2">{isArabic ? "تفعيل" : "Activate"}</span>
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(coupon._id)} className="text-red-600">
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        {isArabic ? "حذف" : "Delete"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    <div className="flex flex-col items-center">
                                        <Gift className="h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            {isArabic
                                                ? "لا توجد كوبونات حتى الآن"
                                                : "No coupons available yet"}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}