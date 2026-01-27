"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ImageUploader from "@/components/ImageUploader";
import { toast } from "sonner";
import { brandService } from "@/lib/api";
import { useLanguage } from "@/components/language-provider";

interface Brand {
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  status: "active" | "inactive";
}

interface BrandFormProps {
  initialData?: Brand | null;
  onSuccess?: () => void;
}

export default function BrandForm({ initialData = null, onSuccess }: BrandFormProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const [form, setForm] = useState<Brand>(
    initialData || { name: "", description: "", image: "", status: "active" }
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error(isArabic ? "الاسم مطلوب" : "Name is required");
      return;
    }
    try {
      setLoading(true);
      if (form._id) {
        await brandService.updateBrand(form._id, form);
        toast.success(isArabic ? "تم التحديث" : "Updated successfully");
      } else {
        await brandService.createBrand(form);
        toast.success(isArabic ? "تم الإنشاء" : "Created successfully");
      }
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div>
        <Label htmlFor="name">{isArabic ? "الاسم" : "Name"} *</Label>
        <Input id="name" name="name" value={form.name} onChange={handleInput} required />
      </div>

      <div>
        <Label htmlFor="description">{isArabic ? "الوصف" : "Description"}</Label>
        <Input id="description" name="description" value={form.description || ""} onChange={handleInput} />
      </div>

      <div>
        <Label>{isArabic ? "صورة" : "Image"}</Label>
        {form.image && (
          <img src={form.image} alt="preview" className="h-24 w-24 object-cover rounded mb-2" />
        )}
        <ImageUploader onUpload={(url) => setForm((prev) => ({ ...prev, image: url }))} />
      </div>

      <div>
        <Label>{isArabic ? "الحالة" : "Status"}</Label>
        <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as any }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{isArabic ? "نشط" : "Active"}</SelectItem>
            <SelectItem value="inactive">{isArabic ? "غير نشط" : "Inactive"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : isArabic ? "حفظ" : "Save"}
      </Button>
    </form>
  );
}
