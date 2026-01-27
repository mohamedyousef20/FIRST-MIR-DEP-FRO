import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import BrandForm from "@/components/admin/BrandForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface BrandsTabProps {
  brands: any[];
  loading: boolean;
  error: string | null;
  isArabic: boolean;
  handleDeleteBrand: (id: string) => void;
  refreshBrands: () => void;
}

export function BrandsTab({ brands, loading, error, isArabic, handleDeleteBrand, refreshBrands }: BrandsTabProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
  }
  if (loading) {
    return <p className="text-muted-foreground">{isArabic ? "جاري التحميل..." : "Loading..."}</p>;
  }
  if (error) {
    return (
      <p className="text-destructive flex items-center gap-1">
        <AlertTriangle className="h-4 w-4" /> {error}
      </p>
    );
  }

  return (
    <> 
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setOpen(true); }}>
              {isArabic ? "إضافة ماركة" : "Add Brand"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? (isArabic ? "تعديل ماركة" : "Edit Brand") : (isArabic ? "إنشاء ماركة" : "Create Brand")}</DialogTitle>
            </DialogHeader>
            <BrandForm
              initialData={editing}
              onSuccess={async () => {
                await refreshBrands();
                closeDialog();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">ID</TableHead>
            <TableHead>{isArabic ? "الاسم" : "Name"}</TableHead>
            <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
            <TableHead>{isArabic ? "تاريخ الإنشاء" : "Created"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                {isArabic ? "لا توجد علامات تجارية" : "No brands found"}
              </TableCell>
            </TableRow>
          ) : (
            brands.map((brand: any) => (
              <TableRow key={brand._id}>
                <TableCell>#{brand._id?.substring(0, 6)}</TableCell>
                <TableCell>{brand.name}</TableCell>
                <TableCell>
                  <Badge variant={brand.status === "active" ? undefined : "destructive"}>
                    {brand.status === "active" ? (isArabic ? "نشط" : "Active") : (isArabic ? "غير نشط" : "Inactive")}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(brand.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell className="space-x-2 rtl:space-x-reverse">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(brand); setOpen(true); }}>
                    {isArabic ? "تعديل" : "Edit"}
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDeleteBrand(brand._id)}>
                    {isArabic ? "حذف" : "Delete"}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
    </>
  );
}
