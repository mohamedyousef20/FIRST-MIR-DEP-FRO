'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { couponService } from '@/lib/api';
import { CalendarIcon } from 'lucide-react';
import { MirvoryPageLoader } from '@/components/MirvoryLoader';
import { useLanguage } from '@/components/language-provider';

export default function EditCouponPage() {
  const params = useParams<{ id: string }>();
  const couponId = params?.id;
  const router = useRouter();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    const loadCoupon = async () => {
      try {
        const res = await couponService.getCoupon(couponId);
        const c = res.data?.data ?? res.data;
        setFormData({
          ...c,
          validFrom: new Date(c.validFrom),
          validUntil: new Date(c.validUntil),
        });
      } catch (e) {
        toast.error(isArabic ? 'فشل تحميل الكوبون' : 'Failed to load coupon');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    if (couponId) loadCoupon();
  }, [couponId]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    if (!formData.code) {
      toast.error(isArabic ? 'الرجاء إدخال كود الكوبون' : 'Please enter coupon code');
      return;
    }
    if (formData.discountValue <= 0) {
      toast.error(isArabic ? 'قيمة الخصم يجب أن تكون أكبر من صفر' : 'Discount must be > 0');
      return;
    }
    setSaving(true);
    try {
      await couponService.updateCoupon(couponId, {
        ...formData,
        validFrom: formData.validFrom.toISOString(),
        validUntil: formData.validUntil.toISOString(),
      });
      toast.success(isArabic ? 'تم التحديث' : 'Coupon updated');
      router.push('/admin/coupons');
    } catch (err: any) {
      toast.error(err.response?.data?.message || (isArabic ? 'فشل التحديث' : 'Update failed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <MirvoryPageLoader />;
  if (!formData) return null;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isArabic ? 'تعديل كوبون' : 'Edit Coupon'}</h1>
        <Button variant="outline" onClick={() => router.back()}>{isArabic ? 'رجوع' : 'Back'}</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'تفاصيل الكوبون' : 'Coupon Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">{isArabic ? 'كود الكوبون' : 'Coupon Code'} *</Label>
                <Input id="code" value={formData.code} onChange={(e) => handleChange('code', e.target.value.toUpperCase())} required />
              </div>
              {/* Discount Type */}
              <div className="space-y-2">
                <Label>{isArabic ? 'نوع الخصم' : 'Discount Type'} *</Label>
                <Select value={formData.discountType} onValueChange={(v: any)=>handleChange('discountType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">{isArabic ? 'نسبة مئوية' : 'Percentage'}</SelectItem>
                    <SelectItem value="fixed">{isArabic ? 'مبلغ ثابت' : 'Fixed'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Discount Value */}
              <div className="space-y-2">
                <Label>{isArabic ? 'قيمة الخصم' : 'Discount Value'}</Label>
                <Input type="number" value={formData.discountValue} onChange={(e)=>handleChange('discountValue', parseFloat(e.target.value))} />
              </div>
              {/* Active */}
              <div className="flex items-center space-x-2 pt-8">
                <Label>{isArabic ? 'نشط' : 'Active'}</Label>
                <Switch checked={formData.isActive} onCheckedChange={(v)=>handleChange('isActive', v)} />
              </div>
            </div>
            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{isArabic ? 'صالح من' : 'Valid From'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal"><CalendarIcon className="h-4 w-4 mr-2" />{format(formData.validFrom,'PPP')}</Button>
                  </PopoverTrigger>
                  <PopoverContent><Calendar mode="single" selected={formData.validFrom} onSelect={(d)=>d&&handleChange('validFrom',d)} /></PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? 'صالح حتى' : 'Valid Until'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal"><CalendarIcon className="h-4 w-4 mr-2" />{format(formData.validUntil,'PPP')}</Button>
                  </PopoverTrigger>
                  <PopoverContent><Calendar mode="single" selected={formData.validUntil} onSelect={(d)=>d&&handleChange('validUntil',d)} /></PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={()=>router.back()}>{isArabic?'إلغاء':'Cancel'}</Button>
              <Button type="submit" disabled={saving}>{saving? (isArabic?'جاري الحفظ...':'Saving...') : (isArabic?'حفظ التغييرات':'Save')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
