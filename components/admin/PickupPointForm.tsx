import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/components/language-provider";
import { useMutation } from "@tanstack/react-query";
import { pickupPointService } from "@/lib/api/services/pickupPointService";
import { PickupPoint } from "@/types/pickup-point";

interface PickupPointFormProps {
  initialData?: PickupPoint | null;
  onSuccess: () => void;
  onClose: () => void;
}

export function PickupPointForm({ initialData, onSuccess, onClose }: PickupPointFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isArabic } = useLanguage();
  const [formData, setFormData] = useState<Partial<PickupPoint>>({
    stationName: initialData?.stationName || "",
    address: initialData?.address || "",
    phone: initialData?.phone || "",
    workingHours: initialData?.workingHours || "",
    location: initialData?.location || { type: "Point", coordinates: [0, 0] },
  });

  const { mutate: createPickupPoint, isPending: isCreating } = useMutation({
    mutationFn: pickupPointService.create,
    onSuccess: () => {
      toast({
        title: isArabic ? "تم إضافة نقطة الاستلام بنجاح" : "Pickup point added successfully",
        description: isArabic ? "تم إضافة نقطة الاستلام الجديدة" : "New pickup point has been added",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: isArabic ? "حدث خطأ" : "Error",
        description: error.response?.data?.message ||
          (isArabic ? "فشل في إضافة نقطة الاستلام" : "Failed to add pickup point"),
        variant: "destructive",
      });
    },
  });

  const { mutate: updatePickupPoint, isPending: isUpdating } = useMutation({
    mutationFn: (data: Partial<PickupPoint>) => pickupPointService.update(initialData!.id, data),
    onSuccess: () => {
      toast({
        title: isArabic ? "تم تحديث نقطة الاستلام بنجاح" : "Pickup point updated successfully",
        description: isArabic ? "تم تحديث بيانات نقطة الاستلام" : "Pickup point information has been updated",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: isArabic ? "حدث خطأ" : "Error",
        description: error.response?.data?.message ||
          (isArabic ? "فشل في تحديث نقطة الاستلام" : "Failed to update pickup point"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      updatePickupPoint(formData as Partial<PickupPoint>);
    } else {
      createPickupPoint(formData as Partial<PickupPoint>);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData
            ? isArabic
              ? "تعديل نقطة الاستلام"
              : "Edit Pickup Point"
            : isArabic
              ? "إضافة نقطة استلام جديدة"
              : "Add New Pickup Point"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="stationName">
                {isArabic ? "اسم نقطة الاستلام" : "Station Name"}
              </Label>
              <Input
                id="stationName"
                value={formData.stationName}
                onChange={(e) =>
                  setFormData({ ...formData, stationName: e.target.value })
                }
                placeholder={isArabic ? "أدخل اسم نقطة الاستلام" : "Enter station name"}
              />
            </div>
            <div>
              <Label htmlFor="address">{isArabic ? "العنوان" : "Address"}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={isArabic ? "أدخل العنوان" : "Enter address"}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="phone">{isArabic ? "رقم الهاتف" : "Phone"}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={isArabic ? "أدخل رقم الهاتف" : "Enter phone number"}
              />
            </div>
            <div>
              <Label htmlFor="workingHours">
                {isArabic ? "أوقات العمل" : "Working Hours"}
              </Label>
              <Input
                id="workingHours"
                value={formData.workingHours}
                onChange={(e) =>
                  setFormData({ ...formData, workingHours: e.target.value })
                }
                placeholder={isArabic ? "أدخل أوقات العمل" : "Enter working hours"}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="latitude">{isArabic ? "الخط العرض" : "Latitude"}</Label>
              <Input
                id="latitude"
                type="number"
                value={formData.location?.coordinates?.[0] ?? 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: {
                      type: "Point",
                      coordinates: [parseFloat(e.target.value), formData.location?.coordinates?.[1] ?? 0],
                    },
                  })
                }
                placeholder={isArabic ? "أدخل خط العرض" : "Enter latitude"}
              />
            </div>
            <div>
              <Label htmlFor="longitude">{isArabic ? "الخط الطول" : "Longitude"}</Label>
              <Input
                id="longitude"
                type="number"
                value={formData.location?.coordinates?.[1] ?? 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: {
                      type: "Point",
                      coordinates: [formData.location?.coordinates?.[0] ?? 0, parseFloat(e.target.value)],
                    },
                  })
                }
                placeholder={isArabic ? "أدخل خط الطول" : "Enter longitude"}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={Boolean(isCreating) || Boolean(isUpdating)}
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={Boolean(isCreating) || Boolean(isUpdating)}
            >
              {isCreating || isUpdating ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></span>
                  {isArabic ? "جاري الحفظ..." : "Saving..."}
                </>
              ) : initialData ? (
                isArabic ? "تحديث" : "Update"
              ) : (
                isArabic ? "إضافة" : "Add"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
