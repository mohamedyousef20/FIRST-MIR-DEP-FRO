'use client';

import { Button } from '@/components/ui/button';
import { useLanguage } from "@/components/language-provider";
import { useRouter } from 'next/navigation';
import AddProductForm from '@/app/admin/products/new/page';

export default function NewProductPage() {
  const { language } = useLanguage();
  const router = useRouter();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}
        </h1>
        <Button onClick={() => router.back()} variant="outline">
          {language === 'ar' ? 'رجوع' : 'Back'}
        </Button>
      </div>

      <AddProductForm onClose={() => router.back()} />
    </div>
  );
}
