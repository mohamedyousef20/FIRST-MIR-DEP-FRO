// pages/auth/login.js
"use client"
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import { authService } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      console.error(err);
      toast.error('تعذر تسجيل الدخول عبر جوجل في الوقت الحالي');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });

      if (response.data.success) {
        toast.success('تم تسجيل الدخول بنجاح');

        // الحصول على الدور من الاستجابة مباشرة إن أمكن
        const role = response.data.data?.user?.role || response.data.role;

        // أو الانتظار قليلاً للتأكد من تعيين الكوكيز قبل إعادة التوجيه
        setTimeout(() => {
          if (role === 'seller') {

            window.location.href = '/vendor/dashboard';
          } else {
            window.location.href = '/';
          }
        }, 100); // تأخير بسيط للتأكد من تعيين الكوكيز
      }
    } catch (err: any) {
      // الحصول على رسالة الخطأ من الاستجابة إن وجدت
      const errorMessage = err.response?.data?.message || 'فشل تسجيل الدخول';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>تسجيل الدخول | ميرفوري</title>
        <meta name="description" content="تسجيل الدخول إلى حساب ميرفوري الخاص بك" />
      </Head>

      <div className="min-h-screen flex flex-col md:flex-row-reverse bg-gray-50" dir="rtl">
        {/* Brand Section */}
        <div className="bg-blue-700 text-white md:w-1/2 p-8 flex flex-col justify-center items-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl font-bold mb-6">ميرفوري</h1>
            <p className="text-xl mb-8">منصة التسوق الإلكتروني المميزة لكل احتياجاتك</p>
            <div className="bg-white/10 p-6 rounded-lg">
              <p className="mb-4 text-lg">لم تقم بإنشاء حساب بعد؟</p>
              <Link href="/auth/register" className="block text-center bg-white text-blue-700 py-3 px-6 rounded-lg font-bold transition-all hover:bg-blue-50">
                إنشاء حساب جديد
              </Link>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="md:w-1/2 p-8 flex justify-center items-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">أهلاً بك مجدداً</h2>
              <p className="text-gray-600">قم بتسجيل الدخول للوصول إلى حسابك</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-700 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                  />
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 mb-2">كلمة المرور</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="أدخل كلمة المرور"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3.5"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="mr-2 block text-sm text-gray-700">
                    تذكرني
                  </label>
                </div>
                <Link href="/auth/password-reset-request" className="text-sm text-blue-600 hover:text-blue-800">
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors ${loading ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
              >
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 text-gray-500">أو تسجيل الدخول باستخدام</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="
      w-full flex items-center justify-center gap-3
      rounded-xl border border-gray-300
      bg-white px-5 py-3
      text-sm font-medium text-gray-700
      shadow-sm
      transition-all duration-200
      hover:bg-gray-50 hover:shadow-md
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      active:scale-[0.98]
    "
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 48 48"
                  >
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.61l6.9-6.9C35.9 2.38 30.47 0 24 0 14.64 0 6.59 5.38 2.56 13.22l8.02 6.22C12.5 13.13 17.77 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.1 24.55c0-1.6-.14-3.14-.41-4.63H24v9.02h12.43c-.54 2.9-2.16 5.36-4.59 7.01l7.06 5.47C43.87 37.13 46.1 31.4 46.1 24.55z" />
                    <path fill="#FBBC05" d="M10.58 28.44a14.5 14.5 0 010-8.88l-8.02-6.22a24.003 24.003 0 000 21.32l8.02-6.22z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.14 15.9-5.78l-7.06-5.47c-1.96 1.32-4.47 2.1-8.84 2.1-6.23 0-11.5-3.63-13.42-8.94l-8.02 6.22C6.59 42.62 14.64 48 24 48z" />
                  </svg>

                  <span>تسجيل الدخول عبر جوجل</span>
                </button>
              </div>


            </div>
          </div>
        </div>
      </div>
    </>
  );
}