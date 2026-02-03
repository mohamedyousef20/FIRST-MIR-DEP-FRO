'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { authService } from '@/lib/api';

const schema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  newPassword: z.string()
    .min(6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف')
    .max(50, 'كلمة المرور يجب أن لا تتجاوز 50 حرف'),
  confirmPassword: z.string().min(6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

export default function ResetPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      setLoading(true);

      // Use authService for password reset
      const response = await authService.resetPassword(
        data.email, 
        data.newPassword
      );

      //TODO need some modification
      if (response.data?.success) {
        toast.success('تم تغيير كلمة المرور بنجاح');
        router.push('/auth/login');
      } else {
        throw new Error(response.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || 'حدث خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>تغيير كلمة المرور | ميرفوري</title>
        <meta name="description" content="تغيير كلمة المرور لحساب ميرفوري الخاص بك" />
      </Head>

      <div className="min-h-screen flex flex-col md:flex-row-reverse bg-gray-50" dir="rtl">
        {/* Brand Section - Same as login page */}
        <div className="bg-blue-700 text-white md:w-1/2 p-8 flex flex-col justify-center items-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl font-bold mb-6">ميرفوري</h1>
            <p className="text-xl mb-8">منصة التسوق الإلكتروني المميزة لكل احتياجاتك</p>
            <div className="bg-white/10 p-6 rounded-lg">
              <p className="mb-4 text-lg">تذكرت كلمة المرور؟</p>
              <Link href="/auth/login" className="block text-center bg-white text-blue-700 py-3 px-6 rounded-lg font-bold transition-all hover:bg-blue-50">
                العودة لتسجيل الدخول
              </Link>
            </div>
          </div>
        </div>

        {/* Reset Password Form */}
        <div className="md:w-1/2 p-8 flex justify-center items-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">تغيير كلمة المرور</h2>
              <p className="text-gray-600">أدخل كلمة المرور الجديدة لحسابك</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field */}
              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-700 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={`w-full pr-4 pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                  />
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2 pr-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* New Password Field */}
              <div className="mb-6">
                <label htmlFor="newPassword" className="block text-gray-700 mb-2">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    {...register('newPassword')}
                    className={`w-full pr-4 pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.newPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="أدخل كلمة المرور الجديدة"
                    required
                  />
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-10 top-3.5"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-2 pr-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">تأكيد كلمة المرور</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register('confirmPassword')}
                    className={`w-full pr-4 pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="أعد إدخال كلمة المرور"
                    required
                  />
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-10 top-3.5"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-2 pr-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري تغيير كلمة المرور...
                  </>
                ) : (
                  <>
                    تغيير كلمة المرور
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Additional Links */}
            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 text-gray-500">خيارات إضافية</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <Link
                  href="/auth/login"
                  className="block text-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  العودة إلى تسجيل الدخول
                </Link>
                <Link
                  href="/auth/register"
                  className="block text-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  إنشاء حساب جديد
                </Link>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium mb-2">متطلبات كلمة المرور:</p>
              <ul className="text-sm text-blue-600 list-disc pr-4 space-y-1">
                <li>يجب أن تكون على الأقل 6 أحرف</li>
                <li>يجب أن لا تتجاوز 50 حرف</li>
                <li>يجب أن تتطابق كلمتا المرور</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}