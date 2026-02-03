import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Plus, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl";

import PaginationControls from "@/components/pagination-controls";

interface ProductsTabProps {
    products: any[];
    loadingProducts: boolean;
    errorProducts: string | null;
    isArabic: boolean;
    pagination: { currentPage: number; totalPages: number };
    onPageChange: (page: number) => void;
    handleApproveProduct: (productId: string) => void;
    handleRejectProduct: (productId: string, sellerId: string, title: string, reason: string) => void;
}

export function ProductsTab({
    products,
    loadingProducts,
    errorProducts,
    isArabic,
    pagination,
    onPageChange,
    handleApproveProduct,
    handleRejectProduct
}: ProductsTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">{isArabic ? "إدارة المنتجات" : "Products Management"}</h2>
                    <p className="text-muted-foreground">
                        {isArabic ? "إدارة وعرض جميع المنتجات في النظام" : "Manage and view all products in the system"}
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/products/new">
                        <Plus className="h-4 w-4 mr-2" />
                        {isArabic ? "إضافة منتج جديد" : "Add New Product"}
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">{isArabic ? "الصورة" : "Image"}</TableHead>
                            <TableHead className="min-w-[150px]">{isArabic ? "المنتج" : "Product"}</TableHead>
                            <TableHead>{isArabic ? "البائع" : "Vendor"}</TableHead>
                            <TableHead className="min-w-[100px]">{isArabic ? "السعر" : "Price"}</TableHead>
                            <TableHead className="min-w-[80px]">{isArabic ? "المخزون" : "Stock"}</TableHead>
                            <TableHead className="min-w-[80px]">{isArabic ? "تم البيع" : "Sold"}</TableHead>
                            <TableHead className="min-w-[100px]">{isArabic ? "التقييم" : "Rating"}</TableHead>
                            <TableHead className="min-w-[120px]">{isArabic ? "الفئة" : "Category"}</TableHead>
                            <TableHead className="min-w-[120px]">{isArabic ? "الحالة" : "Status"}</TableHead>
                            <TableHead className="min-w-[120px]">{isArabic ? "تاريخ التقديم" : "Submitted Date"}</TableHead>
                            <TableHead className="min-w-[150px]">{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadingProducts ? (
                            <TableRow>
                                <TableCell colSpan={11} className="text-center">
                                    <div className="flex flex-col justify-center items-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                                        <p className="text-muted-foreground">
                                            {isArabic ? "جاري تحميل المنتجات..." : "Loading products..."}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : errorProducts ? (
                            <TableRow>
                                <TableCell colSpan={11} className="text-center text-destructive py-8">
                                    <div className="flex flex-col items-center">
                                        <XCircle className="h-12 w-12 mb-4" />
                                        <p>{errorProducts}</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} className="text-center py-12">
                                    <div className="flex flex-col items-center">
                                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            {isArabic ? "لا توجد منتجات" : "No products found"}
                                        </p>
                                        <Button asChild variant="outline" className="mt-4">
                                            <Link href="/admin/products/new">
                                                <Plus className="h-4 w-4 mr-2" />
                                                {isArabic ? "إضافة أول منتج" : "Add First Product"}
                                            </Link>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product: any) => (
                                <TableRow key={product._id}>
                                    <TableCell>
                                        <div className="relative h-12 w-12 rounded-md overflow-hidden">
                                            {/* util to fix malformed cloudinary links */}
                                            <Image
                                                src={(product.images?.[0] && normalizeImageUrl(product.images[0])) || "/placeholder.svg"}
                                                alt={product.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <p className="font-medium truncate max-w-[150px]">
                                                {product.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                ID: {product._id.slice(-6)}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {product.seller
                                                    ? `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim()
                                                    : "Unknown"}
                                            </p>
                                            {product.seller?.email && (
                                                <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                                                    {product.seller.email}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {product.discountPercentage > 0 ? (
                                            <div className="flex flex-col">
                                                <span className="font-medium text-green-600">
                                                    {parseFloat(product.discountedPrice || product.price || 0).toFixed(2)} {isArabic ? "ج.م" : "EGP"}
                                                </span>
                                                <span className="text-xs line-through text-muted-foreground">
                                                    {parseFloat(product.price || 0).toFixed(2)} {isArabic ? "ج.م" : "EGP"}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="font-medium">
                                                {parseFloat(product.price || 0).toFixed(2)} {isArabic ? "ج.م" : "EGP"}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {product.quantity || 0}
                                            {product.quantity < 10 && product.quantity > 0 && (
                                                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                                                    {isArabic ? "منخفض" : "Low"}
                                                </Badge>
                                            )}
                                            {product.quantity === 0 && (
                                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                                                    {isArabic ? "نفذ" : "Out"}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {product.sold || 0}
                                            {product.sold > 50 && (
                                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                                                    {isArabic ? "مباع" : "Sold"}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium">{product.ratingsAverage?.toFixed(1) || "0.0"}</span>
                                                <span className="text-yellow-500">★</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                ({product.ratingsQuantity || 0} {isArabic ? "تقييم" : "reviews"})
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-blue-50">
                                            {product.category
                                                ? (isArabic ? product.category.name : product.category.nameEn || product.category.name)
                                                : "N/A"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={product.isApproved ? "default" : "secondary"}
                                            className={
                                                product.isApproved
                                                    ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200 flex items-center gap-1"
                                                    : "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 flex items-center gap-1"
                                            }
                                        >
                                            {product.isApproved ? <CheckCircle className="h-3 w-3" /> : <Package className="h-3 w-3" />}
                                            {isArabic
                                                ? product.isApproved ? "معتمد" : "قيد المراجعة"
                                                : product.isApproved ? "Approved" : "Pending Review"
                                            }
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {new Date(product.createdAt).toLocaleDateString(
                                                isArabic ? 'ar-EG' : 'en-US',
                                                { year: 'numeric', month: 'short', day: 'numeric' }
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            {!product.isApproved && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleApproveProduct(product._id)}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        {isArabic ? "موافقة" : "Approve"}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => {
                                                            const reason = prompt(
                                                                isArabic 
                                                                    ? `أدخل سبب رفض المنتج "${product.title}"`
                                                                    : `Enter rejection reason for "${product.title}"`
                                                            );
                                                            if (reason) {
                                                                handleRejectProduct(
                                                                    product._id,
                                                                    product.seller?._id || product.seller,
                                                                    product.title,
                                                                    reason
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        {isArabic ? "رفض" : "Reject"}
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full justify-start"
                                                asChild
                                            >
                                                <Link href={`/products/${product._id}`}>
                                                    {isArabic ? "عرض التفاصيل" : "View Details"}
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {!loadingProducts && products.length > 0 && (
                <PaginationControls
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={onPageChange}
                    className="justify-end pt-4"
                    labels={{ previous: "السابق" , next: "التالي" }}
                />
            )}
        </div>
    );
}