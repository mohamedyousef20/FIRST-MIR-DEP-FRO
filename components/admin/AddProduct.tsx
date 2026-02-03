"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { productService } from "@/lib/api/services/productService";
import { Plus, Image as ImageIcon, Upload } from "lucide-react";
import Image from "next/image";

interface AddProductProps {
  onProductAdded?: () => void;
  isArabic?: boolean;
}

interface TranslationKeys {
  productAdded: string;
  addProductFailed: string;
  addProduct: string;
  adding: string;
  price: string;
  enterPrice: string;
  stock: string;
  enterStock: string;
  selectCategory: string;
  addImages: string;
  productName: string;
  productNameEn: string;
  description: string;
  descriptionEn: string;
  productImages: string;
  electronics: string;
  clothing: string;
  home: string;
  beauty: string;
}

const translations: Record<"ar" | "en", TranslationKeys> = {
  ar: {
    productAdded: "تم إضافة المنتج بنجاح",
    addProductFailed: "فشل في إضافة المنتج",
    addProduct: "إضافة منتج",
    adding: "جاري الإضافة...",
    price: "السعر",
    enterPrice: "أدخل السعر",
    stock: "الكمية",
    enterStock: "أدخل الكمية",
    selectCategory: "اختر الفئة",
    addImages: "إضافة صور",
    productName: "اسم المنتج",
    productNameEn: "اسم المنتج (الإنجليزية)",
    description: "وصف المنتج",
    descriptionEn: "وصف المنتج (الإنجليزية)",
    productImages: "صور المنتج",
    electronics: "إلكترونيات",
    clothing: "ملابس",
    home: "منزل وحياة",
    beauty: "جمال"
  },
  en: {
    productAdded: "Product added successfully",
    addProductFailed: "Failed to add product",
    addProduct: "Add Product",
    adding: "Adding...",
    price: "Price",
    enterPrice: "Enter price",
    stock: "Stock Quantity",
    enterStock: "Enter stock quantity",
    selectCategory: "Select category",
    addImages: "Add Images",
    productName: "Product Name (Arabic)",
    productNameEn: "Product Name (English)",
    description: "Description (Arabic)",
    descriptionEn: "Description (English)",
    productImages: "Product Images",
    electronics: "Electronics",
    clothing: "Clothing",
    home: "Home & Living",
    beauty: "Beauty"
  }
};

export function AddProduct({ onProductAdded, isArabic = false }: AddProductProps) {
  const router = useRouter();
  const { language, t } = useLanguage();
  type Lang = keyof typeof translations;
  type TranslationKey = keyof TranslationKeys;
  const lang: Lang = isArabic ? 'ar' : 'en';
  const translate = (key: TranslationKey): string => translations[lang][key];
  const [loading, setLoading] = useState(false);
  interface ProductFormData {
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    price: string;
    stock: string;
    category: string;
    images: string[];
  }

  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    titleEn: isArabic ? "" : "",
    description: "",
    descriptionEn: isArabic ? "" : "",
    price: "",
    stock: "",
    category: "",
    images: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        title: formData.title,
        titleEn: formData.titleEn,
        description: formData.description,
        descriptionEn: formData.descriptionEn,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        images: formData.images,
      };

      await productService.createProduct(productData);
      toast.success(translate("productAdded"));

      if (onProductAdded) {
        onProductAdded();
      }

      // Reset form
      setFormData({
        title: "",
        titleEn: "",
        description: "",
        descriptionEn: "",
        price: "",
        stock: "",
        category: "",
        images: [],
      });
    } catch (error) {
      toast.error(translate("addProductFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Here you would typically upload the file to your server
      // and get the URL back. For now, we'll just use a placeholder
      imageUrls.push(URL.createObjectURL(file));
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...imageUrls] }));
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{translate("addProduct")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">{translate("productName")}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={translate("productName")}
                required
                dir={isArabic ? "rtl" : "ltr"}
              />
            </div>
            <div>
              <Label htmlFor="titleEn">{translate("productNameEn")}</Label>
              <Input
                id="titleEn"
                value={formData.titleEn}
                onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                placeholder={translate("productNameEn")}
                required
                dir={isArabic ? "rtl" : "ltr"}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="price">{translate("price")}</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder={translate("enterPrice")}
                required
              />
            </div>
            <div>
              <Label htmlFor="stock">{translate("stock")}</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                placeholder={translate("enterStock")}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="category">{translate("selectCategory")}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={translate("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">{translate("electronics")}</SelectItem>
                  <SelectItem value="clothing">{translate("clothing")}</SelectItem>
                  <SelectItem value="home">{translate("home")}</SelectItem>
                  <SelectItem value="beauty">{translate("beauty")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">{translate("description")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={translate("description")}
              required
              dir={isArabic ? "rtl" : "ltr"}
            />
          </div>

          <div>
            <Label htmlFor="descriptionEn">{translate("descriptionEn")}</Label>
            <Textarea
              id="descriptionEn"
              value={formData.descriptionEn}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
              placeholder={translate("descriptionEn")}
              required
              dir={isArabic ? "rtl" : "ltr"}
            />
          </div>

          <div>
            <Label>{translate("productImages")}</Label>
            <div className="space-y-4">
              {formData.images.map((url, index) => (
                <div key={index} className="relative w-32 h-32">
                  <Image
                    src={url}
                    alt="Product"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => document.getElementById("imageInput")?.click()}
              >
                <Upload className="h-4 w-4" />
                {translate("addImages")}
              </Button>
              <input
                type="file"
                id="imageInput"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? translate("adding") : translate("addProduct")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
