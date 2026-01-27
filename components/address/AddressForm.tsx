'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useEffect } from 'react';

// Updated schema to match backend
const addressSchema = z.object({
  street: z.string().min(5, 'الشارع مطلوب'),
  city: z.string().min(2, 'المدينة مطلوبة'),
  state: z.string().min(2, 'المحافظة مطلوبة'),
  country: z.string().default('Egypt'),
  postalCode: z.string().min(3, 'الرمز البريدي مطلوب'),
  isDefault: z.boolean().default(true),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function AddressFormInSignUp({ onChange }: { onChange: (data: AddressFormData) => void }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: 'Egypt',
      isDefault: true,
    },
  });

  // Watch all fields and auto-update parent
  const watchedFields = watch();

  // Auto-submit when fields change (optional, or keep manual submit)
  const onSubmit = (data: AddressFormData) => {
    onChange(data);
    toast.success("تم حفظ بيانات العنوان");
  };

  // Auto-update parent when fields change
  useEffect(() => {
    const subscription = watch((value) => {
      if (value.street && value.city && value.state && value.postalCode) {
        onChange(value as AddressFormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6" dir="rtl">
      {/* الشارع */}
      <div className="space-y-1">
        <label className="text-sm font-medium">الشارع *</label>
        <Controller
          name="street"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className={`w-full px-3 py-2 border rounded-lg ${errors.street ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="اسم الشارع والمنطقة"
            />
          )}
        />
        {errors.street && <p className="text-red-500 text-sm">{errors.street.message}</p>}
      </div>

      {/* المدينة والمحافظة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">المدينة *</label>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={`w-full px-3 py-2 border rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="المدينة"
              />
            )}
          />
          {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">المحافظة *</label>
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={`w-full px-3 py-2 border rounded-lg ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="المحافظة"
              />
            )}
          />
          {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
        </div>
      </div>

      {/* الرمز البريدي */}
      <div className="space-y-1">
        <label className="text-sm font-medium">الرمز البريدي *</label>
        <Controller
          name="postalCode"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className={`w-full px-3 py-2 border rounded-lg ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="الرمز البريدي"
            />
          )}
        />
        {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode.message}</p>}
      </div>

      {/* البلد (ثابت) */}
      <div className="space-y-1">
        <label className="text-sm font-medium">البلد</label>
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              disabled
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 border-gray-300"
            />
          )}
        />
      </div>

      {/* الزر */}
      <div className="pt-4">
        <button
          type="submit"
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          حفظ العنوان
        </button>
      </div>
    </form>
  );
}