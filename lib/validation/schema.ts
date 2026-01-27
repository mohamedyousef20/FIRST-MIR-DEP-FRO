import { z } from 'zod';

// Shared validation schemas
export const userSchemas = {
  // User schemas
  register: z.object({
    firstName: z.string()
      .min(2, { message: 'الاسم الأول يجب أن يكون على الأقل 2 حرف' })
      .max(50, { message: 'الاسم الأول يجب أن لا يتجاوز 50 حرف' }),
    lastName: z.string()
      .min(2, { message: 'الاسم الأخير يجب أن يكون على الأقل 2 حرف' })
      .max(50, { message: 'الاسم الأخير يجب أن لا يتجاوز 50 حرف' }),
    email: z.string()
      .email({ message: 'البريد الإلكتروني غير صحيح' }),
    password: z.string()
      .min(8, { message: 'كلمة المرور يجب أن تكون على الأقل 8 أحرف' })
      .max(50, { message: 'كلمة المرور يجب أن لا تتجاوز 50 حرف' }),
    phone: z.string()
      .regex(/^\+?\d{10,15}$/, { message: 'رقم الهاتف غير صحيح' }),
    role: z.enum(['user', 'seller', 'admin'], { message: 'الدور غير صحيح' }),
  }).required(),

  // Profile update schema
  updateProfile: z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    email: z.string().email().optional(),
    phone: z.string().regex(/^\+?\d{10,15}$/).optional(),
  }).refine(
    data => Object.keys(data).length > 0,
    { message: 'يجب تعديل حقل واحد على الأقل' }
  ),


  login: z.object({
    email: z.string()
      .email({ message: 'البريد الإلكتروني غير صحيح' }),
    password: z.string()
      .min(8, { message: 'كلمة المرور يجب أن تكون على الأقل 8 أحرف' }),
  }).required(),

  profile: z.object({
    firstName: z.string()
      .min(2, { message: 'الاسم الأول يجب أن يكون على الأقل 2 حرف' })
      .max(50, { message: 'الاسم الأول يجب أن لا يتجاوز 50 حرف' })
      .optional(),

    lastName: z.string()
      .min(2, { message: 'الاسم الأخير يجب أن يكون على الأقل 2 حرف' })
      .max(50, { message: 'الاسم الأخير يجب أن لا يتجاوز 50 حرف' })
      .optional(),

    email: z.string()
      .email({ message: 'البريد الإلكتروني غير صحيح' })
      .optional(),

    phone: z.string()
      .regex(/^\+?\d{10,15}$/, { message: 'رقم الهاتف غير صحيح' })
      .optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'يجب تعديل حقل واحد على الأقل',
      path: ['_form'], // يجعل الخطأ عام وليس مرتبط بحقل معين
    }
  ),


  // Seller-specific schemas
  sellerRegistration: z.object({
    companyName: z.string()
      .min(3, { message: 'اسم الشركة يجب أن يكون على الأقل 3 أحرف' })
      .max(100, { message: 'اسم الشركة يجب أن لا يتجاوز 100 حرف' }),
    commercialRegistration: z.string()
      .min(10, { message: 'رقم السجل التجاري يجب أن يكون على الأقل 10 أرقام' })
      .max(15, { message: 'رقم السجل التجاري يجب أن لا يتجاوز 15 رقم' }),
    businessAddress: z.string()
      .min(10, { message: 'العنوان يجب أن يكون على الأقل 10 أحرف' })
      .max(200, { message: 'العنوان يجب أن لا يتجاوز 200 حرف' }),
    businessPhone: z.string()
      .regex(/^\+?\d{10,15}$/, { message: 'رقم الهاتف التجاري غير صحيح' }),
    businessEmail: z.string()
      .email({ message: 'البريد الإلكتروني التجاري غير صحيح' }),
  }).required(),

  // Admin-specific schemas
  adminProfile: z.object({
    department: z.string()
      .min(2, { message: 'اسم القسم يجب أن يكون على الأقل 2 حرف' })
      .max(50, { message: 'اسم القسم يجب أن لا يتجاوز 50 حرف' }),
    position: z.string()
      .min(2, { message: 'المنصب يجب أن يكون على الأقل 2 حرف' })
      .max(50, { message: 'المنصب يجب أن لا يتجاوز 50 حرف' }),
    employeeId: z.string()
      .min(5, { message: 'رقم الموظف يجب أن يكون على الأقل 5 أرقام' })
      .max(10, { message: 'رقم الموظف يجب أن لا يتجاوز 10 أرقام' }),
  }).required(),

  // Pickup Point schemas
  pickupPoint: z.object({
    stationName: z.object({
      ar: z.string()
        .min(2, { message: 'اسم النقطة بالعربية يجب أن يكون على الأقل 2 حرف' })
        .max(50, { message: 'اسم النقطة بالعربية يجب أن لا يتجاوز 50 حرف' }),
      en: z.string()
        .min(2, { message: 'اسم النقطة بالإنجليزية يجب أن يكون على الأقل 2 حرف' })
        .max(50, { message: 'اسم النقطة بالإنجليزية يجب أن لا يتجاوز 50 حرف' }),
    }).required(),
    address: z.object({
      ar: z.string()
        .min(10, { message: 'العنوان بالعربية يجب أن يكون على الأقل 10 أحرف' })
        .max(200, { message: 'العنوان بالعربية يجب أن لا يتجاوز 200 حرف' }),
      en: z.string()
        .min(10, { message: 'العنوان بالإنجليزية يجب أن يكون على الأقل 10 أحرف' })
        .max(200, { message: 'العنوان بالإنجليزية يجب أن لا يتجاوز 200 حرف' }),
    }).required(),
    phone: z.string()
      .regex(/^\+?\d{10,15}$/, { message: 'رقم الهاتف غير صحيح' }),
    workingHours: z.object({
      ar: z.string()
        .min(5, { message: 'ساعات العمل بالعربية يجب أن تكون على الأقل 5 أحرف' })
        .max(50, { message: 'ساعات العمل بالعربية يجب أن لا تتجاوز 50 حرف' }),
      en: z.string()
        .min(5, { message: 'ساعات العمل بالإنجليزية يجب أن تكون على الأقل 5 أحرف' })
        .max(50, { message: 'ساعات العمل بالإنجليزية يجب أن لا تتجاوز 50 حرف' }),
    }).required(),
    status: z.enum(['active', 'inactive'], { message: 'الحالة غير صحيحة' }),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.array(z.number()).length(2, { message: 'يجب أن يحتوي الموقع على إحداثيات X و Y' }),
    }).required(),
  }).required(),
};

// Export types for TypeScript
export type UserRegister = z.infer<typeof userSchemas.register>;
export type UserLogin = z.infer<typeof userSchemas.login>;
export type UserProfile = z.infer<typeof userSchemas.profile>;
export type SellerRegistration = z.infer<typeof userSchemas.sellerRegistration>;
export type AdminProfile = z.infer<typeof userSchemas.adminProfile>;
export type PickupPoint = z.infer<typeof userSchemas.pickupPoint>;
