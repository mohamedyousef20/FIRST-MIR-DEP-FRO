"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { Eye, EyeOff, Mail, User, Lock, Phone, Store, IdCard, MapPin, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { authService } from "@/lib/api";

export default function SellerSignup() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    role: "seller",
    vendorProfile: {
      storeName: "",
      ownerName: "",
      phone: "",
      nationalId: "",
      city: "",
      payoutMethod: "instapay",
      payoutAccount: ""
    }
  });

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      console.error(err);
      toast.error('تعذر تسجيل الدخول عبر جوجل في الوقت الحالي');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
      return;
    }

    if (name.startsWith("vendorProfile.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        vendorProfile: {
          ...formData.vendorProfile,
          [field]: value
        }
      });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const errors = [];

    if (!formData.firstName || !formData.lastName) errors.push("الاسم مطلوب");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.push("بريد إلكتروني غير صالح");
    if (!/^01[0125][0-9]{8}$/.test(formData.phone)) errors.push("رقم هاتف مصري فقط");
    if (formData.password.length < 8) errors.push("كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل");
    if (formData.password !== formData.confirmPassword) errors.push("كلمتا المرور غير متطابقتين");

    const v = formData.vendorProfile;
    if (!v.storeName) errors.push("اسم المتجر مطلوب");
    if (!v.ownerName) errors.push("اسم صاحب المتجر مطلوب");
    if (!/^01[0125][0-9]{8}$/.test(v.phone)) errors.push("رقم تواصل المتجر غير صالح");
    if (!/^[0-9]{14}$/.test(v.nationalId)) errors.push("الرقم القومي يجب أن يكون 14 رقم");
    if (!v.payoutAccount) errors.push("بيانات استلام الأرباح مطلوبة");
    if (!formData.acceptTerms) errors.push("يجب الموافقة على الشروط والأحكام");

    return errors.length > 0 ? errors.join(". ") : null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    try {
      await (authService.register as any)({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: "seller",
        vendorProfile: formData.vendorProfile,
        phone: formData.phone,
      });

      toast.success("تم إنشاء حساب البائع بنجاح، يرجى تفعيل البريد الإلكتروني");
      router.push("/verifyEmail");
    } catch (e: any) {
      setError(e.response?.data?.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>تسجيل بائع جديد | ميرفوري</title>
        <meta name="description" content="انضم كبائع في منصة ميرفوري وابدأ بيع منتجاتك" />
      </Head>

      <div className="min-h-screen flex flex-col md:flex-row-reverse bg-gray-50" dir="rtl">
        {/* Brand Section */}
        <div className="bg-blue-700 text-white md:w-1/2 p-8 flex flex-col justify-center items-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl font-bold mb-6">ميرفوري للبائعين</h1>
            <p className="text-xl mb-8">انضم إلينا كبائع وابدأ بيع منتجاتك على منصتنا</p>
            <div className="bg-white/10 p-6 rounded-lg">
              <p className="mb-4 text-lg">لديك حساب بائع بالفعل؟</p>
              <Link href="/auth/login" className="block text-center bg-white text-blue-700 py-3 px-6 rounded-lg font-bold transition-all hover:bg-blue-50">
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <div className="md:w-1/2 p-8 flex justify-center items-center">
          <div className="w-full max-w-md py-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">تسجيل بائع جديد</h2>
              <p className="text-gray-600">أنشئ حساب بائع وابدأ ببيع منتجاتك</p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="mr-3">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Personal Information Section */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">المعلومات الشخصية</h3>

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
                  <label htmlFor="phone" className="block text-gray-700 mb-2">رقم الهاتف الشخصي</label>
                  <div className="relative">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="01012345678"
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
              </div>

              {/* Business Information Section */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">معلومات المتجر</h3>

                <div className="mb-6">
                  <label htmlFor="vendorProfile.storeName" className="block text-gray-700 mb-2">اسم المتجر</label>
                  <div className="relative">
                    <input
                      id="vendorProfile.storeName"
                      name="vendorProfile.storeName"
                      type="text"
                      value={formData.vendorProfile.storeName}
                      onChange={handleChange}
                      className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="اسم المتجر"
                      required
                    />
                    <Store className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="vendorProfile.ownerName" className="block text-gray-700 mb-2">اسم صاحب المتجر</label>
                  <div className="relative">
                    <input
                      id="vendorProfile.ownerName"
                      name="vendorProfile.ownerName"
                      type="text"
                      value={formData.vendorProfile.ownerName}
                      onChange={handleChange}
                      className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="اسم صاحب المتجر"
                      required
                    />
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="vendorProfile.phone" className="block text-gray-700 mb-2">رقم تواصل المتجر</label>
                  <div className="relative">
                    <input
                      id="vendorProfile.phone"
                      name="vendorProfile.phone"
                      type="tel"
                      value={formData.vendorProfile.phone}
                      onChange={handleChange}
                      className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="01012345678"
                      required
                    />
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="vendorProfile.nationalId" className="block text-gray-700 mb-2">الرقم القومي</label>
                  <div className="relative">
                    <input
                      id="vendorProfile.nationalId"
                      name="vendorProfile.nationalId"
                      type="text"
                      value={formData.vendorProfile.nationalId}
                      onChange={handleChange}
                      className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="14 رقم"
                      required
                      minLength={14}
                      maxLength={14}
                    />
                    <IdCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">يجب أن يتكون من 14 رقم</p>
                </div>

                <div className="mb-6">
                  <label htmlFor="vendorProfile.city" className="block text-gray-700 mb-2">المدينة</label>
                  <div className="relative">
                    <input
                      id="vendorProfile.city"
                      name="vendorProfile.city"
                      type="text"
                      value={formData.vendorProfile.city}
                      onChange={handleChange}
                      className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="المدينة"
                      required
                    />
                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="vendorProfile.payoutMethod" className="block text-gray-700 mb-2">طريقة استلام الأرباح</label>
                    <div className="relative">
                      <select
                        id="vendorProfile.payoutMethod"
                        name="vendorProfile.payoutMethod"
                        value={formData.vendorProfile.payoutMethod}
                        onChange={handleChange}
                        className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none bg-white"
                        required
                      >
                        <option value="instapay">InstaPay</option>
                        <option value="vodafone_cash">Vodafone Cash</option>
                        <option value="bank">حساب بنكي</option>
                      </select>
                      <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="vendorProfile.payoutAccount" className="block text-gray-700 mb-2">حساب الاستلام</label>
                    <div className="relative">
                      <input
                        id="vendorProfile.payoutAccount"
                        name="vendorProfile.payoutAccount"
                        type="text"
                        value={formData.vendorProfile.payoutAccount}
                        onChange={handleChange}
                        className="w-full pr-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="رقم الحساب"
                        required
                      />
                      <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="acceptTerms" className="mr-2 block text-sm text-gray-700">
                    أوافق على <Link href="/seller/terms" className="text-blue-600 hover:text-blue-800">الشروط والأحكام</Link> و <Link href="/seller/privacy" className="text-blue-600 hover:text-blue-800">سياسة الخصوصية</Link>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors ${loading ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
              >
                {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب بائع'}
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