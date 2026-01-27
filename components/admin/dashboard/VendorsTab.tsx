import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import PaginationControls from "@/components/pagination-controls";

interface VendorsTabProps {
    sellers: any[];
    isArabic: boolean;
    updatingUserId: string | null;
    pagination: { currentPage: number; totalPages: number };
    onPageChange: (page: number) => void;
    onDelete(id: string): void;
    onSoftDelete(id: string): void;
    onRestore(id: string): void;
    onToggleTrust(id: string, trusted: boolean): void;
}

export function VendorsTab({ sellers, isArabic, updatingUserId, pagination, onPageChange, onDelete, onSoftDelete, onRestore, onToggleTrust }: VendorsTabProps) {
    return (
        <div className="space-y-6">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">{isArabic ? "المعرف" : "ID"}</TableHead>
                            <TableHead>{isArabic ? "البائع" : "Vendor"}</TableHead>
                            <TableHead>{isArabic ? "البريد الإلكتروني" : "Email"}</TableHead>
                            <TableHead>{isArabic ? "المنتجات" : "Products"}</TableHead>
                            <TableHead>{isArabic ? "الرصيد" : "Balance"}</TableHead>
                            <TableHead>{isArabic ? "موثوق" : "Trusted"}</TableHead>
                            <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                            <TableHead>{isArabic ? "تاريخ الانضمام" : "Join Date"}</TableHead>
                            <TableHead>{isArabic ? "إجراءات" : "Actions"}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sellers && sellers.length > 0 ? (
                            sellers.map((seller: any) => (
                                <TableRow key={seller._id}>
                                    <TableCell className="font-medium">#{seller._id?.substring(0, 6)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {seller.fullName || `${seller.firstName || ''} ${seller.lastName || ''}`.trim()}
                                            </span>
                                            <span className="text-sm text-muted-foreground">{seller.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{seller.email}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                            {isArabic ? "قريباً" : "Coming Soon"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {seller.wallet?.balance || 0} {seller.wallet?.currency || 'EGP'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {isArabic ? "معلق: " : "Pending: "}
                                                {seller.wallet?.pendingBalance || 0} {seller.wallet?.currency || 'EGP'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={seller.isTrustedSeller ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {seller.isTrustedSeller ? (isArabic ? 'موثوق' : 'Trusted') : (isArabic ? 'غير موثق' : 'Untrusted')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={seller.isActive ? undefined : "destructive"}
                                            className={seller.isActive
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                            }
                                        >
                                            {seller.isActive ? (isArabic ? "نشط" : "Active") : (isArabic ? "غير نشط" : "Inactive")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }) : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {updatingUserId === seller._id ? (
                                            <span className="text-sm text-muted-foreground">...</span>
                                        ) : seller.isDeleted ? (
                                            <button onClick={() => onRestore(seller._id)} className="text-primary hover:underline">
                                                {isArabic ? 'استعادة' : 'Restore'}
                                            </button>
                                        ) : (
                                            <div className="space-x-2 rtl:space-x-reverse">
                                                <button onClick={() => onToggleTrust(seller._id, !seller.isTrustedSeller)} className="text-blue-600 hover:underline">
                                                    {seller.isTrustedSeller ? (isArabic ? 'إلغاء التوثيق' : 'Unverify') : (isArabic ? 'توثيق' : 'Verify')}
                                                </button>
                                                <button onClick={() => onSoftDelete(seller._id)} className="text-yellow-600 hover:underline">
                                                    {isArabic ? 'تعطيل' : 'Disable'}
                                                </button>
                                                <button onClick={() => onDelete(seller._id)} className="text-destructive hover:underline">
                                                    {isArabic ? 'حذف' : 'Delete'}
                                                </button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8">
                                    <div className="flex flex-col items-center">
                                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            {isArabic ? "لا توجد بيانات للبائعين بعد" : "No vendor data available yet"}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        {/* Pagination */}
            {sellers.length > 0 && (
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