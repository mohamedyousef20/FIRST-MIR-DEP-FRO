'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { pickupPointService } from '@/lib/api/services/pickupPointService';
import { MapPin, Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PickupPoint {
  _id?: string;
  stationName: string;
  address: string;
  workingHours: string;
  phone: string;
  status: 'active' | 'inactive';
}

export function PickupPointsManager({ isArabic }: { isArabic: boolean }) {
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<PickupPoint | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPickupPoints = async () => {
    try {
      setIsLoading(true);
      const data = await pickupPointService.getAll();
      setPickupPoints(data as unknown as PickupPoint[]);
    } catch (error) {
      console.error('Error fetching pickup points:', error);
      toast.error(isArabic ? 'فشل في تحميل نقاط الاستلام' : 'Failed to load pickup points');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPickupPoints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPickupPoint) return;

    try {
      if (selectedPickupPoint._id) {
        await pickupPointService.update(selectedPickupPoint._id, selectedPickupPoint);
        toast.success(isArabic ? 'تم تحديث نقطة الاستلام بنجاح' : 'Pickup point updated successfully');
      } else {
        await pickupPointService.create(selectedPickupPoint);
        toast.success(isArabic ? 'تم إنشاء نقطة الاستلام بنجاح' : 'Pickup point created successfully');
      }
      setShowForm(false);
      setSelectedPickupPoint(null);
      fetchPickupPoints();
    } catch (error) {
      console.error('Error saving pickup point:', error);
      toast.error(isArabic ? 'حدث خطأ أثناء حفظ نقطة الاستلام' : 'Error saving pickup point');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isArabic ? 'هل أنت متأكد من حذف نقطة الاستلام؟' : 'Are you sure you want to delete this pickup point?')) {
      return;
    }
    try {
      await pickupPointService.delete(id);
      toast.success(isArabic ? 'تم حذف نقطة الاستلام بنجاح' : 'Pickup point deleted successfully');
      fetchPickupPoints();
    } catch (error) {
      console.error('Error deleting pickup point:', error);
      toast.error(isArabic ? 'حدث خطأ أثناء حذف نقطة الاستلام' : 'Error deleting pickup point');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {isArabic ? 'إدارة نقاط الاستلام' : 'Pickup Points Management'}
          </h2>
          <p className="text-muted-foreground">
            {isArabic ? 'إدارة نقاط الاستلام المتاحة للعملاء' : 'Manage available pickup points for customers'}
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedPickupPoint({
              stationName: '',
              address: '',
              workingHours: '',
              phone: '',
              status: 'active'
            });
            setShowForm(true);
          }}
          className="w-full md:w-auto"
        >
          <Plus className="h-4 w-4 ml-2" />
          {isArabic ? 'إضافة نقطة استلام جديدة' : 'Add New Pickup Point'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedPickupPoint?._id
                ? (isArabic ? 'تعديل نقطة الاستلام' : 'Edit Pickup Point')
                : (isArabic ? 'إضافة نقطة استلام جديدة' : 'Add New Pickup Point')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stationName">
                    {isArabic ? 'اسم المحطة' : 'Station Name'}
                  </Label>
                  <Input
                    id="stationName"
                    value={selectedPickupPoint?.stationName || ''}
                    onChange={(e) => setSelectedPickupPoint(prev => prev ? ({ ...prev, stationName: e.target.value }) : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">
                    {isArabic ? 'العنوان' : 'Address'}
                  </Label>
                  <Input
                    id="address"
                    value={selectedPickupPoint?.address || ''}
                    onChange={(e) => setSelectedPickupPoint(prev => prev ? ({ ...prev, address: e.target.value }) : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workingHours">
                    {isArabic ? 'ساعات العمل' : 'Working Hours'}
                  </Label>
                  <Input
                    id="workingHours"
                    value={selectedPickupPoint?.workingHours || ''}
                    onChange={(e) => setSelectedPickupPoint(prev => prev ? ({ ...prev, workingHours: e.target.value }) : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={selectedPickupPoint?.phone || ''}
                    onChange={(e) => setSelectedPickupPoint(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">
                    {isArabic ? 'الحالة' : 'Status'}
                  </Label>
                  <Select
                    value={selectedPickupPoint?.status || 'active'}
                    onValueChange={(value) => setSelectedPickupPoint(prev => prev ? ({ ...prev, status: value as 'active' | 'inactive' }) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isArabic ? 'اختر الحالة' : 'Select status'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        {isArabic ? 'نشط' : 'Active'}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {isArabic ? 'غير نشط' : 'Inactive'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedPickupPoint(null);
                  }}
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit">
                  {selectedPickupPoint?._id
                    ? (isArabic ? 'تحديث' : 'Update')
                    : (isArabic ? 'إنشاء' : 'Create')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pickupPoints.map((point) => (
          <Card key={point._id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    {point.stationName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{point.workingHours}</p>
                </div>
                <Badge variant={point.status === 'active' ? 'default' : 'secondary'}>
                  {point.status === 'active'
                    ? (isArabic ? 'نشط' : 'Active')
                    : (isArabic ? 'غير نشط' : 'Inactive')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>{point.address}</p>
                <p className="text-muted-foreground">{point.phone}</p>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPickupPoint(point);
                    setShowForm(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isArabic ? 'تعديل' : 'Edit'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(point._id!)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isArabic ? 'حذف' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
