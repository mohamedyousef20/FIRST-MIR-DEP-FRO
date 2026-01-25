// pages/auth/signup.js
"use client"
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { Eye, EyeOff, Mail, User, Lock, Phone, Building2, MapPin, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import { saveToken, saveUser, authService } from '@/lib/api';

export default function Signup() {

  // Get dispatch function
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: "user",
    vendorProfile: {
      businessName: '',
      businessType: 'individual',
      taxID: '',
      description: ''
    },
    preferences: {
      language: 'ar',
      currency: 'EGP',
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name.includes('address.')) {
      const [, field] = name.split('address.');
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else if (name.includes('vendorProfile.')) {
      const [, field] = name.split('vendorProfile.');
      setFormData(prev => ({
        ...prev,
        vendorProfile: {
          ...prev.vendorProfile,
          [field]: value
        }
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setLoading(false);
      return;
    }

    // Validate password complexity
    if (formData.password.length < 8) {
      setError('كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل');
      setLoading(false);
      return;
    }

    // Validate Egyptian phone number
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('رقم الهاتف غير صالح. يجب أن يكون رقم هاتف مصري');
      setLoading(false);
      return;
    }

    // If vendor, validate business name
    if (formData.role === 'seller' && !formData.vendorProfile.businessName) {
      setError('اسم العمل مطلوب للتجار');
      setLoading(false);
      return;
    }

    try {
      // Build payload excluding confirmPassword and optional objects not accepted by API
      const {
        confirmPassword, // omit
        vendorProfile,
        preferences,
        ...rest
      } = formData;

      const payload: any = { ...rest };
      // Include vendorProfile only for sellers
      if (formData.role === 'seller') {
        payload.vendorProfile = vendorProfile;
      }

      const response = await authService.register(payload);
      if (response.data) {
        toast.success('تم التسجيل بنجاح، يرجى تفعيل البريد الإلكتروني');
        router.push('/verifyEmail');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Head>
        <title>إنشاء حساب جديد | ميرفوري</title>
        <meta name="description" content="إنشاء حساب جديد في منصة ميرفوري للتسوق" />
      </Head>

      <div className="min-h-screen flex flex-col md:flex-row-reverse bg-gray-50" dir="rtl">
        {/* Brand Section */}
        <div className="bg-blue-700 text-white md:w-1/2 p-8 flex flex-col justify-center items-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl font-bold mb-6">ميرفوري</h1>
            <p className="text-xl mb-8">انضم إلينا واستمتع بتجربة تسوق فريدة من نوعها</p>
            <div className="bg-white/10 p-6 rounded-lg">
              <p className="mb-4 text-lg">لديك حساب بالفعل؟</p>
              <Link href="/login" className="block text-center bg-white text-blue-700 py-3 px-6 rounded-lg font-bold transition-all hover:bg-blue-50">
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <div className="md:w-1/2 p-8 flex justify-center items-center">
          <div className="w-full max-w-md py-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">إنشاء حساب جديد</h2>
              <p className="text-gray-600">أنشئ حسابك واستمتع بالتسوق معنا</p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="firstName" className="block text-gray-700 mb-2">الاسم الأول</label>
                  <div className="relative">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="الاسم الأول"
                      required
                    />
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-gray-700 mb-2">الاسم الأخير</label>
                  <div className="relative">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="الاسم الأخير"
                      required
                    />
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-700 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                  />
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="phone" className="block text-gray-700 mb-2">رقم الهاتف</label>
                <div className="relative">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="05xxxxxxxx"
                    required
                  />
                  <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                <p className="mt-1 text-xs text-gray-500">مثال: 01012345678 (رقم هاتف مصري)</p>
              </div>

    
              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 mb-2">كلمة المرور</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="أدخل كلمة المرور"
                    required
                    minLength={8}
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
                <p className="mt-1 text-xs text-gray-500">يجب أن تحتوي على 8 أحرف على الأقل</p>
              </div>

              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">تأكيد كلمة المرور</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="أعد إدخال كلمة المرور"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-3.5"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="mr-2 block text-sm text-gray-700">
                    أوافق على <Link href="/terms" className="text-blue-600 hover:text-blue-800">الشروط والأحكام</Link> و <Link href="/privacy" className="text-blue-600 hover:text-blue-800">سياسة الخصوصية</Link>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors ${loading ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
              >
                {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 text-gray-500">أو التسجيل باستخدام</span>
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