'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { Mail, ArrowRight, Shield, Clock, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { authService } from '@/lib/api';

const schema = z.object({
  code: z.string().min(6, 'الكود يجب أن يكون 6 أرقام').max(6, 'الكود يجب أن يكون 6 أرقام'),
});

export default function PasswordResetVerify() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // Cooldown in seconds
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const COOLDOWN_TIME = 180; // 3 minutes in seconds

  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (cooldown > 0) {
      setIsResendDisabled(true);
      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [cooldown]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      setLoading(true);

      const response = await authService.verifyResetCode(data.code);

      if (response.data?.success) {
        toast.success('تم التحقق بنجاح');
        router.push(`/auth/reset-password?email=${encodeURIComponent(emailParam)}`);
      } else {
        throw new Error(response.data?.message || 'الكود غير صحيح');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || 'الكود غير صحيح. يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (isResendDisabled || resendLoading || !emailParam) {
      return;
    }

    try {
      setResendLoading(true);

      const resp = await authService.forgotPassword(emailParam);

      if (resp.data?.success) {
        toast.success('تم إرسال الكود مرة أخرى');
        // Start cooldown timer
        setCooldown(COOLDOWN_TIME);
      } else {
        throw new Error(resp.data?.message || 'حدث خطأ');
      }
    } catch (err: any) {
      // Check if it's a cooldown error from backend
      const errorMessage = err?.response?.data?.message || err.message || 'حدث خطأ';

      if (errorMessage.includes("يجب الانتظار") || errorMessage.includes("دقيقة")) {
        // Extract time from error message
        const timeMatch = errorMessage.match(/(\d+)\s*دقيقة/);
        if (timeMatch && timeMatch[1]) {
          const minutes = parseInt(timeMatch[1]);
          setCooldown(minutes * 60);
        }
      } else if (err?.response?.status === 429) {
        // Too many requests
        setCooldown(COOLDOWN_TIME);
        toast.error("لقد قمت بمحاولات كثيرة، يرجى الانتظار قبل إعادة المحاولة");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setResendLoading(false);
    }
  };

  // Check if email is available
  if (!emailParam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">خطأ في البيانات</h2>
          <p className="text-gray-600 mb-6">لم يتم العثور على بريد إلكتروني للتحقق منه.</p>
          <Link
            href="/auth/forgot-password"
            className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            العودة لإدخال البريد الإلكتروني
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>تحقق من كود إعادة التعيين | ميرفوري</title>
        <meta name="description" content="تحقق من كود إعادة تعيين كلمة المرور لحساب ميرفوري الخاص بك" />
      </Head>

      <div className="min-h-screen flex flex-col md:flex-row-reverse bg-gray-50" dir="rtl">
        {/* Brand Section - Same as other pages */}
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

        {/* Verification Form */}
        <div className="md:w-1/2 p-8 flex justify-center items-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">تحقق من كود إعادة التعيين</h2>
              <p className="text-gray-600">أدخل الكود المكون من 6 أرقام الذي تم إرساله إلى بريدك الإلكتروني</p>

              {emailParam && (
                <div className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-blue-50 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600 ml-2" />
                  <span className="text-blue-700 font-medium text-sm">{emailParam}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">
                <label htmlFor="code" className="block text-gray-700 mb-2">كود التحقق</label>
                <div className="relative">
                  <input
                    id="code"
                    type="text"
                    maxLength={6}
                    {...register('code')}
                    className={`w-full pr-4 pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-center text-xl tracking-widest ${errors.code ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="٠٠٠٠٠٠"
                    dir="ltr"
                    required
                  />
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.code && (
                  <p className="text-red-500 text-sm mt-2 pr-1">
                    {errors.code.message}
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
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    تحقق من الكود
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Resend Code Section */}
            <div className="mt-6 text-center">
              {isResendDisabled ? (
                <div className="inline-flex items-center justify-center space-x-2 space-x-reverse bg-gray-100 px-4 py-3 rounded-lg w-full">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-gray-700 font-medium">
                      يمكنك إعادة الإرسال خلال {formatTime(cooldown)}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      يجب الانتظار 3 دقائق بين كل محاولة
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || !emailParam}
                  className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${resendLoading || !emailParam
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                    }`}
                >
                  {resendLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5" />
                      لم تستلم الكود؟ إعادة الإرسال
                    </>
                  )}
                </button>
              )}

            </div>

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
                  href="/auth/forgot-password"
                  className="block text-center text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  إعادة إدخال البريد الإلكتروني
                </Link>
                <Link
                  href="/auth/login"
                  className="block text-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  العودة إلى تسجيل الدخول
                </Link>
              </div>
            </div>

        
          </div>
        </div>
      </div>
    </>
  );
}