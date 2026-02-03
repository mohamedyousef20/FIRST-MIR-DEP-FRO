'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from "@/components/language-provider";
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { couponService } from '@/lib/api';
import { MirvoryPageLoader } from '@/components/MirvoryLoader';

// Global Coupon type available across the frontend
// This is declared in a .d.ts file so importing is not required
// Fields align with backend Coupon schema and frontend usage
interface Coupon {
  _id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minPurchaseAmount?: number
  maxDiscountAmount?: number
  validFrom: string | Date
  validUntil: string | Date
  maxUses?: number
  currentUses?: number
  isActive: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}

export default function NewCouponPage() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Coupon, '_id' | 'currentUses' | 'createdAt' | 'updatedAt'>>({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minPurchaseAmount: 0,
    maxDiscountAmount: 100,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    maxUses: 100,
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.code) {
      toast.error(isArabic ? 'الرجاء إدخال كود الكوبون' : 'Please enter a coupon code');
      return;
    }

    if (formData.discountValue <= 0) {
      toast.error(isArabic ? 'يجب أن تكون قيمة الخصم أكبر من صفر' : 'Discount value must be greater than zero');
      return;
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      toast.error(isArabic ? 'لا يمكن أن تزيد نسبة الخصم عن 100%' : 'Discount percentage cannot exceed 100%');
      return;
    }

    if (formData.validFrom >= formData.validUntil) {
      toast.error(isArabic ? 'يجب أن يكون تاريخ الانتهاء بعد تاريخ البداية' : 'End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      await couponService.createCoupon({
        ...formData,
        code: formData.code.toUpperCase(),
      });

      toast.success(isArabic ? 'تم إنشاء الكوبون بنجاح' : 'Coupon created successfully');
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      toast.error(
        error.response?.data?.message ||
        (isArabic ? 'فشل إنشاء الكوبون' : 'Failed to create coupon')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleChange('code', result);
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isArabic ? 'كوبون جديد' : 'New Coupon'}
        </h1>
        <Button
          variant="outline"
          onClick={() => router.push('/admin/coupons')}
        >
          {isArabic ? 'رجوع' : 'Back'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'تفاصيل الكوبون' : 'Coupon Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coupon Code */}
              <div className="space-y-2">
                <Label htmlFor="code">
                  {isArabic ? 'كود الكوبون' : 'Coupon Code'} *
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                    placeholder="مثال: SUMMER20"
                    className="font-mono"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateRandomCode}
                  >
                    {isArabic ? 'توليد' : 'Generate'}
                  </Button>
                </div>
              </div>

              {/* Discount Type */}
              <div className="space-y-2">
                <Label htmlFor="discountType">
                  {isArabic ? 'نوع الخصم' : 'Discount Type'} *
                </Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: 'percentage' | 'fixed') =>
                    handleChange('discountType', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isArabic ? 'اختر النوع' : 'Select type'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      {isArabic ? 'نسبة مئوية' : 'Percentage'}
                    </SelectItem>
                    <SelectItem value="fixed">
                      {isArabic ? 'مبلغ ثابت' : 'Fixed Amount'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Value */}
              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  {formData.discountType === 'percentage'
                    ? (isArabic ? 'نسبة الخصم %' : 'Discount Percentage')
                    : (isArabic ? 'قيمة الخصم' : 'Discount Amount')} *
                </Label>
                <div className="relative">
                  <Input
                    id="discountValue"
                    type="number"
                    min="0"
                    step={formData.discountType === 'percentage' ? '0.1' : '1'}
                    value={formData.discountValue}
                    onChange={(e) => handleChange('discountValue', parseFloat(e.target.value) || 0)}
                    required
                  />

                </div>
              </div>

              {/* Max Discount Amount (only for percentage) */}
              {formData.discountType === 'percentage' && (
                <div className="space-y-2">
                  <Label htmlFor="maxDiscountAmount">
                    {isArabic ? 'الحد الأقصى للخصم' : 'Maximum Discount'} (جنية)
                  </Label>
                  <Input
                    id="maxDiscountAmount"
                    type="number"
                    min="0"
                    value={formData.maxDiscountAmount || ''}
                    onChange={(e) => handleChange('maxDiscountAmount', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isArabic
                      ? 'اتركه فارغًا لعدم وجود حد أقصى'
                      : 'Leave empty for no maximum'}
                  </p>
                </div>
              )}

              {/* Minimum Purchase Amount */}
              <div className="space-y-2">
                <Label htmlFor="minPurchaseAmount">
                  {isArabic ? 'الحد الأدنى للشراء' : 'Minimum Purchase'} (جنية)
                </Label>
                <Input
                  id="minPurchaseAmount"
                  type="number"
                  min="0"
                  value={formData.minPurchaseAmount || ''}
                  onChange={(e) => handleChange('minPurchaseAmount', parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Valid From */}
              <div className="space-y-2">
                <Label>{isArabic ? 'صالح من' : 'Valid From'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {formData.validFrom ? (
                        format(new Date(formData.validFrom), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(formData.validFrom)}
                      onSelect={(date) => date && handleChange('validFrom', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Valid Until */}
              <div className="space-y-2">
                <Label>{isArabic ? 'صالح حتى' : 'Valid Until'} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {formData.validUntil ? (
                        format(new Date(formData.validUntil), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(formData.validUntil)}
                      onSelect={(date) => date && handleChange('validUntil', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Max Uses */}
              <div className="space-y-2">
                <Label htmlFor="maxUses">
                  {isArabic ? 'الحد الأقصى للاستخدامات' : 'Maximum Uses'}
                </Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  value={formData.maxUses}
                  onChange={(e) => handleChange('maxUses', parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground">
                  {isArabic
                    ? 'اتركه فارغًا لعدد غير محدود من الاستخدامات'
                    : 'Leave empty for unlimited uses'}
                </p>
              </div>

              {/* Is Active */}
              <div className="flex items-center justify-between space-x-2 pt-2">
                <Label htmlFor="isActive" className="flex flex-col space-y-1">
                  <span>{isArabic ? 'نشط' : 'Active'}</span>
                  <span className="text-xs text-muted-foreground">
                    {isArabic
                      ? 'سيتمكن العملاء من استخدام هذا الكوبون'
                      : 'Customers can use this coupon'}
                  </span>
                </Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleChange('isActive', checked)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/coupons')}
                disabled={loading}
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? (

                  <MirvoryPageLoader text={language === "ar" ? "جاري التحميل..." : "Loading..."} />
                ) : (
                  isArabic ? 'حفظ الكوبون' : 'Save Coupon'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
