'use client'

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { addressService, authService, userService } from '@/lib/api';
import { useValidation } from '@/hooks/useValidation';
import { MirvoryPageLoader } from '@/components/MirvoryLoader';

// مكونات UI محسنة
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar";
import {
    Badge
} from "@/components/ui/badge";

import {
    Input
} from "@/components/ui/input";
import {
    Label
} from "@/components/ui/label";
import {
    Button
} from "@/components/ui/button";
import {
    Separator
} from "@/components/ui/separator";
import {
    Switch
} from "@/components/ui/switch";
import {
    Alert,
    AlertDescription,
    AlertTitle
} from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Textarea
} from "@/components/ui/textarea";
import {
    Progress
} from "@/components/ui/progress";

// أيقونات
import {
    User,
    Mail,
    Phone,
    MapPin,
    Shield,
    Settings,
    Lock,
    Bell,
    CreditCard,
    Package,
    Truck,
    CheckCircle,
    AlertCircle,
    Edit,
    Trash2,
    Star,
    Calendar,
    Globe,
    Wallet,
    Clock,
    Flag,
    Building,
    Home,
    Briefcase,
    ChevronRight,
    Upload,
    Camera,
    Eye,
    EyeOff,
    LogOut,
    RefreshCw,
    ShieldCheck,
    Activity,
    History,
    Plus
} from 'lucide-react';

// تعريف المدن والمحافظات
const EGYPT_GOVERNORATES = [
    { value: 'القاهرة', label: 'القاهرة', cities: ['مدينة نصر', 'مصر الجديدة', 'المهندسين', 'المعادي', 'الشيخ زايد'] },
    { value: 'الجيزة', label: 'الجيزة', cities: ['الدقي', 'المهندسين', 'العجوزة', 'الهرم', '6 أكتوبر'] },
    { value: 'الإسكندرية', label: 'الإسكندرية', cities: ['سموحة', 'سيدي جابر', 'المنتزه', 'العجمي', 'المندرة'] },
    { value: 'المنيا', label: 'المنيا', cities: ['المنيا الجديدة', 'ملوي', 'دير مواس', 'سمالوط'] },
    { value: 'أسيوط', label: 'أسيوط', cities: ['أسيوط الجديدة', 'ديروط', 'منفلوط', 'القوصية'] },
];

const INITIAL_ADDRESS_FORM = {
    state: '',
    city: '',
    district: '',
    street: '',
    buildingNumber: '',
    apartmentNumber: '',
    landmark: '',
    label: 'home',
    isDefault: true
};

const Profile = () => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // States
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        profileImage: '',
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

    // preference helpers
    const handlePreferenceChange = (
        key: 'language' | 'currency',
        value: string
    ) => {
        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [key]: value
            }
        }));
    };

    const handleNotificationChange = (
        key: 'email' | 'sms' | 'push',
        value: boolean
    ) => {
        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                notifications: {
                    ...prev.preferences.notifications,
                    [key]: value
                }
            }
        }));
    };

    const [addressForm, setAddressForm] = useState({ ...INITIAL_ADDRESS_FORM });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [user, setUser] = useState<any>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [addressLoading, setAddressLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [error, setError] = useState('');
    const [addressError, setAddressError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // Initialize validation
    const { errors, validate } = useValidation('updateProfile');

    // تحميل البيانات الأولية
    useEffect(() => {
        fetchProfile();
        fetchAddresses();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await authService.getCurrentUser();
            const userData = response.data.data?.user || response.data;

            setUser(userData);
            setFormData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                phone: userData.phone || '',
                profileImage: userData.profileImage || '',
                preferences: userData.preferences || {
                    language: 'ar',
                    currency: 'EGP',
                    notifications: {
                        email: true,
                        sms: false,
                        push: true
                    }
                }
            });
        } catch (err: any) {
            setError(err.message || 'فشل تحميل الملف الشخصي');
            toast.error('فشل تحميل الملف الشخصي');
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const response = await addressService.getAddresses();
            setAddresses(response.data.data || []);
        } catch (err: any) {
            console.error('Error fetching addresses:', err);
            setAddresses([]);
        }
    };

    // معالجة تغيير صورة الملف الشخصي
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            // هنا يمكنك إضافة منطق رفع الصورة
            // const formData = new FormData();
            // formData.append('image', file);
            // const response = await userService.uploadProfileImage(formData);

            // مؤقتاً: عرض الصورة محلياً
            const imageUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, profileImage: imageUrl }));
            toast.success('تم تحديث صورة الملف الشخصي');
        } catch (err) {
            toast.error('فشل تحديث الصورة');
        } finally {
            setIsUploadingImage(false);
        }
    };

    // معالجة إضافة/تحديث العنوان
    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddressLoading(true);
        setAddressError('');

        try {
            if (!addressForm.city || !addressForm.district || !addressForm.street) {
                setAddressError('جميع الحقول المطلوبة يجب ملؤها');
                setAddressLoading(false);
                return;
            }

            const addressData = {
                state: addressForm.state,
                city: addressForm.city,
                district: addressForm.district,
                street: addressForm.street,
                buildingNumber: addressForm.buildingNumber,
                apartmentNumber: addressForm.apartmentNumber,
                landmark: addressForm.landmark,
                label: addressForm.label,
                isDefault: addressForm.isDefault
            };

            if (editingAddressId) {
                await addressService.updateAddress(editingAddressId, addressData);
                toast.success('تم تحديث العنوان بنجاح');
            } else {
                await addressService.addAddress(addressData);
                toast.success('تم إضافة العنوان بنجاح');
            }

            // إعادة تعيين النموذج وتحديث البيانات
            setAddressForm({ ...INITIAL_ADDRESS_FORM });
            setIsEditingAddress(false);
            setEditingAddressId(null);
            await fetchAddresses();
        } catch (err: any) {
            console.error('Address error:', err);
            setAddressError(err.response?.data?.message || 'فشل حفظ العنوان');
            toast.error('فشل حفظ العنوان');
        } finally {
            setAddressLoading(false);
        }
    };

    // معالجة حذف العنوان
    const handleDeleteAddress = async () => {
        if (!addressToDelete) return;

        try {
            await addressService.deleteAddress(addressToDelete);
            toast.success('تم حذف العنوان بنجاح');
            await fetchAddresses();
            setIsDeleteDialogOpen(false);
            setAddressToDelete(null);
        } catch (err: any) {
            console.error('Delete address error:', err);
            toast.error(err.response?.data?.message || 'فشل حذف العنوان');
        }
    };

    // معالجة تعيين العنوان الافتراضي
    const handleSetDefaultAddress = async (addressId: string) => {
        try {
            await addressService.setDefaultAddress(addressId);
            toast.success('تم تعيين العنوان كافتراضي بنجاح');
            await fetchAddresses();
        } catch (err: any) {
            console.error('Set default address error:', err);
            toast.error(err.response?.data?.message || 'فشل تعيين العنوان الافتراضي');
        }
    };

    // معالجة تحرير العنوان
    const handleEditAddress = (address: any) => {
        setAddressForm({
            state: address.state || '',
            city: address.city || '',
            district: address.district || '',
            street: address.street || '',
            buildingNumber: address.buildingNumber || '',
            apartmentNumber: address.apartmentNumber || '',
            landmark: address.landmark || '',
            label: address.label || 'home',
            isDefault: Boolean(address.isDefault)
        });
        setIsEditingAddress(true);
        setEditingAddressId(address._id || address.id || null);
        setAddressError('');
    };

    // معالجة تغيير كلمة المرور
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordError('');

        try {
            // التحقق من صحة البيانات
            if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
                setPasswordError('جميع الحقول مطلوبة');
                setPasswordLoading(false);
                return;
            }

            if (passwordForm.newPassword.length < 8) {
                setPasswordError('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل');
                setPasswordLoading(false);
                return;
            }

            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                setPasswordError('كلمة المرور الجديدة وتأكيدها غير متطابقين');
                setPasswordLoading(false);
                return;
            }

            if (passwordForm.currentPassword === passwordForm.newPassword) {
                setPasswordError('كلمة المرور الجديدة يجب أن تختلف عن كلمة المرور الحالية');
                setPasswordLoading(false);
                return;
            }

            const response = await authService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword,
            });

            // إعادة تعيين النموذج
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            toast.success('تم تغيير كلمة المرور بنجاح');
            setIsPasswordDialogOpen(false);

            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);

        } catch (err: any) {
            console.error('Password change error:', err);
            const errorMessage = err.response?.data?.message ||
                err.message ||
                'فشل تغيير كلمة المرور، يرجى المحاولة مرة أخرى';
            setPasswordError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setPasswordLoading(false);
        }
    };

    // معالجة تحديث الملف الشخصي
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const filteredData = Object.fromEntries(
                Object.entries(formData).filter(([key, value]) => value !== '' && value != null)
            );

            const isValid = await validate(filteredData);
            if (!isValid) {
                setLoading(false);
                return;
            }

            await userService.updateProfile(filteredData);
            toast.success('تم تحديث الملف الشخصي بنجاح');
            setIsEditing(false);
            await fetchProfile();
        } catch (err: any) {
            setError(err.message || 'فشل تحديث الملف الشخصي');
            toast.error('فشل تحديث الملف الشخصي');
        } finally {
            setLoading(false);
        }
    };

    // دالة مساعدة لتنسيق التاريخ
    const formatDate = (dateString: string) => {
        if (!dateString) return 'غير محدد';
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // توليد الأحرف الأولى للصورة الرمزية
    const getInitials = () => {
        if (!user) return 'US';
        return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'US';
    };

    // الحصول على لون الدور
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-500';
            case 'seller': return 'bg-blue-500';
            case 'user': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    // الحصول على نص الدور
    const getRoleText = (role: string) => {
        switch (role) {
            case 'admin': return 'مدير النظام';
            case 'seller': return 'تاجر';
            case 'user': return 'مستخدم';
            default: return role;
        }
    };

    // الحصول على أيقونة نوع العنوان
    const getAddressIcon = (type: string) => {
        switch (type) {
            case 'home': return <Home className="h-5 w-5" />;
            case 'work': return <Briefcase className="h-5 w-5" />;
            default: return <MapPin className="h-5 w-5" />;
        }
    };

    // حساب قوة كلمة المرور
    const calculatePasswordStrength = (password: string) => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        return strength;
    };

    if (loading && !user) {
        return <MirvoryPageLoader text={'جاري تحميل الملف الشخصي...'} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/90 shadow-lg">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
                                    <AvatarImage src={user?.profileImage} />
                                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/80 to-primary">
                                        {getInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                                    <Camera className="h-4 w-4" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={isUploadingImage}
                                    />
                                </label>
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold text-white">
                                    {user?.firstName} {user?.lastName}
                                </h1>
                                <p className="text-white/90 mt-1 flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    {user?.email}
                                </p>
                                <div className="flex items-center gap-3 mt-3">
                                    <Badge className={`${getRoleColor(user?.role)} text-white`}>
                                        {getRoleText(user?.role)}
                                    </Badge>
                                    {user?.isVerified ? (
                                        <Badge className="bg-green-500 text-white flex items-center gap-1">
                                            <ShieldCheck className="h-3 w-3" />
                                            محقق
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive" className="flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            غير محقق
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                                onClick={() => setActiveTab('password')}
                            >
                                <Lock className="h-4 w-4 mr-2" />
                                تغيير كلمة المرور
                            </Button>
                            {!user?.isVerified && (
                                <Link href="/verifyEmail">
                                    <Button className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        تفعيل الحساب
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardContent className="p-6">
                                <nav className="space-y-2">
                                    <Button
                                        variant={activeTab === 'personal' ? 'default' : 'ghost'}
                                        className="w-full justify-start"
                                        onClick={() => setActiveTab('personal')}
                                    >
                                        <User className="h-4 w-4 mr-3" />
                                        المعلومات الشخصية
                                    </Button>

                                    <Button
                                        variant={activeTab === 'account' ? 'default' : 'ghost'}
                                        className="w-full justify-start"
                                        onClick={() => setActiveTab('account')}
                                    >
                                        <Shield className="h-4 w-4 mr-3" />
                                        معلومات الحساب
                                    </Button>

                                    {user?.role === 'seller' && (
                                        <Button
                                            variant={activeTab === 'vendor' ? 'default' : 'ghost'}
                                            className="w-full justify-start"
                                            onClick={() => setActiveTab('vendor')}
                                        >
                                            <Building className="h-4 w-4 mr-3" />
                                            معلومات التاجر
                                        </Button>
                                    )}

                                    <Button
                                        variant={activeTab === 'preferences' ? 'default' : 'ghost'}
                                        className="w-full justify-start"
                                        onClick={() => setActiveTab('preferences')}
                                    >
                                        <Settings className="h-4 w-4 mr-3" />
                                        التفضيلات
                                    </Button>

                                    <Button
                                        variant={activeTab === 'addresses' ? 'default' : 'ghost'}
                                        className="w-full justify-start"
                                        onClick={() => setActiveTab('addresses')}
                                    >
                                        <MapPin className="h-4 w-4 mr-3" />
                                        العناوين
                                    </Button>

                                    <Button
                                        variant={activeTab === 'security' ? 'default' : 'ghost'}
                                        className="w-full justify-start"
                                        onClick={() => setActiveTab('security')}
                                    >
                                        <Lock className="h-4 w-4 mr-3" />
                                        الأمان
                                    </Button>

                                    <Button
                                        variant={activeTab === 'activity' ? 'default' : 'ghost'}
                                        className="w-full justify-start"
                                        onClick={() => setActiveTab('activity')}
                                    >
                                        <Activity className="h-4 w-4 mr-3" />
                                        النشاطات
                                    </Button>

                                    <Separator className="my-4" />

                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => router.push('/auth/logout')}
                                    >
                                        <LogOut className="h-4 w-4 mr-3" />
                                        تسجيل الخروج
                                    </Button>
                                </nav>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        {/* Personal Information */}
                        {activeTab === 'personal' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        المعلومات الشخصية
                                    </CardTitle>
                                    <CardDescription>
                                        إدارة معلوماتك الشخصية وبيانات الاتصال
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {error && (
                                        <Alert variant="destructive" className="mb-6">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>خطأ</AlertTitle>
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">الاسم الأول *</Label>
                                                <Input
                                                    id="firstName"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                                    placeholder="أدخل اسمك الأول"
                                                    disabled={!isEditing}
                                                />
                                                {errors.firstName && (
                                                    <p className="text-sm text-destructive">{errors.firstName}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">الاسم الأخير *</Label>
                                                <Input
                                                    id="lastName"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                                    placeholder="أدخل اسمك الأخير"
                                                    disabled={!isEditing}
                                                />
                                                {errors.lastName && (
                                                    <p className="text-sm text-destructive">{errors.lastName}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">البريد الإلكتروني *</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        value={formData.email}
                                                        disabled
                                                        className="bg-gray-50"
                                                    />
                                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                                        {user?.isVerified ? (
                                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                                        ) : (
                                                            <AlertCircle className="h-5 w-5 text-destructive" />
                                                        )}
                                                    </div>
                                                </div>
                                                <p className={`text-sm ${user?.isVerified ? 'text-green-600' : 'text-destructive'}`}>
                                                    {user?.isVerified ? '✓ تم التحقق من البريد الإلكتروني' : '⚠ لم يتم التحقق من البريد الإلكتروني'}
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone">رقم الهاتف *</Label>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                    placeholder="01XXXXXXXXX"
                                                    disabled={!isEditing}
                                                />
                                                {errors.phone && (
                                                    <p className="text-sm text-destructive">{errors.phone}</p>
                                                )}
                                            </div>
                                        </div>

                                        {!isEditing ? (
                                            <Button
                                                type="button"
                                                onClick={() => setIsEditing(true)}
                                                className="mt-6"
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                تعديل المعلومات
                                            </Button>
                                        ) : (
                                            <div className="flex gap-3 pt-6">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        fetchProfile();
                                                    }}
                                                >
                                                    إلغاء
                                                </Button>
                                                <Button type="submit" disabled={loading}>
                                                    {loading ? (
                                                        <>
                                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                            جاري الحفظ...
                                                        </>
                                                    ) : (
                                                        'حفظ التغييرات'
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Account Information */}
                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="h-5 w-5" />
                                            معلومات الحساب
                                        </CardTitle>
                                        <CardDescription>
                                            تفاصيل حسابك وإعدادات الأمان
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                                    <span className="font-medium">معرف المستخدم</span>
                                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                        {user?.id?.slice(0, 8)}...
                                                    </code>
                                                </div>

                                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                                    <span className="font-medium">حالة الحساب</span>
                                                    <Badge variant={user?.isActive ? 'default' : 'destructive'}>
                                                        {user?.isActive ? 'نشط' : 'غير نشط'}
                                                    </Badge>
                                                </div>

                                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                                    <span className="font-medium">تاريخ الإنشاء</span>
                                                    <span className="text-sm text-gray-600">
                                                        {formatDate(user?.createdAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                                    <span className="font-medium">آخر تحديث</span>
                                                    <span className="text-sm text-gray-600">
                                                        {formatDate(user?.updatedAt)}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                                    <span className="font-medium">آخر تسجيل دخول</span>
                                                    <span className="text-sm text-gray-600">
                                                        {formatDate(user?.lastLogin)}
                                                    </span>
                                                </div>

                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium">أمان الحساب</span>
                                                        <Badge variant={user?.isVerified ? 'default' : 'destructive'}>
                                                            {user?.isVerified ? 'آمن' : 'يحتاج تفعيل'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {user?.isVerified
                                                            ? 'تم التحقق من بريدك الإلكتروني ويمكنك استخدام كافة الميزات'
                                                            : 'يرجى تفعيل بريدك الإلكتروني لاستخدام كافة الميزات'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Wallet Information for Sellers */}
                                {user?.role === 'seller' && user?.wallet && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Wallet className="h-5 w-5" />
                                                المحفظة
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <Wallet className="h-6 w-6 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-green-700 font-medium">الرصيد المتاح</p>
                                                            <p className="text-2xl font-bold text-green-900">
                                                                {user.wallet.balance} {user.wallet.currency}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <Clock className="h-6 w-6 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-blue-700 font-medium">الرصيد المعلق</p>
                                                            <p className="text-2xl font-bold text-blue-900">
                                                                {user.wallet.pendingBalance?.toFixed(2)} {user.wallet.currency}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-2 bg-purple-100 rounded-lg">
                                                            <CreditCard className="h-6 w-6 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-purple-700 font-medium">إجمالي الرصيد</p>
                                                            <p className="text-2xl font-bold text-purple-900">
                                                                {(user.wallet.balance || 0) + (user.wallet.pendingBalance || 0)} {user.wallet.currency}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* Vendor Information */}
                        {activeTab === 'vendor' && user?.vendorProfile && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        معلومات التاجر
                                    </CardTitle>
                                    <CardDescription>
                                        تفاصيل نشاطك التجاري
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <Label className="text-sm text-gray-500 mb-1">اسم النشاط التجاري</Label>
                                                <p className="font-medium">{user.vendorProfile.businessName}</p>
                                            </div>

                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <Label className="text-sm text-gray-500 mb-1">نوع النشاط</Label>
                                                <p className="font-medium">
                                                    {user.vendorProfile.businessType === 'individual' ? 'تاجر فردي' :
                                                        user.vendorProfile.businessType === 'company' ? 'شركة' : 'مؤسسة'}
                                                </p>
                                            </div>

                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <Label className="text-sm text-gray-500 mb-1">السجل التجاري</Label>
                                                <p className="font-medium">{user.vendorProfile.taxID || 'غير محدد'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Label className="text-sm text-yellow-700">التقييم</Label>
                                                    <div className="flex items-center">
                                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                        <span className="font-bold text-lg mr-1">{user.vendorProfile.rating?.toFixed(1)}</span>
                                                    </div>
                                                </div>
                                                <Progress value={(user.vendorProfile.rating || 0) * 20} className="h-2" />
                                            </div>

                                            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-sm text-green-700">إجمالي المبيعات</Label>
                                                    <p className="text-2xl font-bold text-green-900">
                                                        {user.vendorProfile.totalSales?.toFixed(0)} طلب
                                                    </p>
                                                </div>
                                            </div>

                                            {user.vendorProfile.description && (
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <Label className="text-sm text-gray-500 mb-2">وصف النشاط</Label>
                                                    <p className="text-gray-700">{user.vendorProfile.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Preferences */}
                        {activeTab === 'preferences' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        التفضيلات
                                    </CardTitle>
                                    <CardDescription>
                                        إعدادات اللغة والعملة والإشعارات
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label htmlFor="language">اللغة</Label>
                                                <Select
                                                    value={formData.preferences.language}
                                                    onValueChange={(value) => handlePreferenceChange('language', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="اختر اللغة" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ar">العربية</SelectItem>
                                                        <SelectItem value="en">English</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="currency">العملة</Label>
                                                <Select
                                                    value={formData.preferences.currency}
                                                    onValueChange={(value) => handlePreferenceChange('currency', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="اختر العملة" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                                                        <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                                                        <SelectItem value="EUR">يورو (EUR)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <Bell className="h-5 w-5" />
                                                إعدادات الإشعارات
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">إشعارات البريد الإلكتروني</p>
                                                        <p className="text-sm text-gray-600">تلقي تحديثات عبر البريد الإلكتروني</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.preferences.notifications.email}
                                                        onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">إشعارات التطبيق</p>
                                                        <p className="text-sm text-gray-600">تلقي إشعارات داخل التطبيق</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.preferences.notifications.push}
                                                        onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">رسائل SMS</p>
                                                        <p className="text-sm text-gray-600">تلقي رسائل نصية</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.preferences.notifications.sms}
                                                        onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end">
                                    <Button onClick={handleProfileUpdate} disabled={loading}>
                                        {loading ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                جاري الحفظ...
                                            </>
                                        ) : 'حفظ التغييرات'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {/* Addresses */}
                        {activeTab === 'addresses' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <MapPin className="h-5 w-5" />
                                                    العناوين
                                                </CardTitle>
                                                <CardDescription>
                                                    إدارة عناوين الشحن والتوصيل
                                                </CardDescription>
                                            </div>
                                            <Button onClick={() => setIsDialogOpen(true)}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                إضافة عنوان جديد
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {addressError && (
                                            <Alert variant="destructive" className="mb-6">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>{addressError}</AlertDescription>
                                            </Alert>
                                        )}

                                        {addresses.length === 0 ? (
                                            <div className="text-center py-12">
                                                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <MapPin className="h-12 w-12 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold mb-2">لا توجد عناوين</h3>
                                                <p className="text-gray-600 mb-6">أضف عنوانك الأول لبدء التسوق</p>
                                                <Button onClick={() => setIsDialogOpen(true)}>
                                                    إضافة أول عنوان
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {addresses.map((address) => (
                                                    <Card key={address._id} className={address.isDefault ? 'border-primary' : ''}>
                                                        <CardHeader className="pb-3">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex items-center gap-2">
                                                                    {getAddressIcon(address.label)}
                                                                    <CardTitle className="text-base">
                                                                        {address.label === 'home' ? 'منزل' :
                                                                            address.label === 'work' ? 'عمل' : 'أخرى'}
                                                                    </CardTitle>
                                                                    {address.isDefault && (
                                                                        <Badge className="bg-primary">افتراضي</Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => handleEditAddress(address)}
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            setAddressToDelete(address._id);
                                                                            setIsDeleteDialogOpen(true);
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="pb-3">
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                                    <span>{address.street}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Building className="h-4 w-4 text-gray-400" />
                                                                    <span>{address.district}, {address.city}</span>
                                                                </div>
                                                                {address.landmark && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Flag className="h-4 w-4 text-gray-400" />
                                                                        <span>{address.landmark}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                        <CardFooter>
                                                            {!address.isDefault && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full"
                                                                    onClick={() => handleSetDefaultAddress(address._id)}
                                                                >
                                                                    تعيين كافتراضي
                                                                </Button>
                                                            )}
                                                        </CardFooter>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Add/Edit Address Dialog */}
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>
                                                {editingAddressId ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
                                            </DialogTitle>
                                            <DialogDescription>
                                                املأ جميع الحقول المطلوبة
                                            </DialogDescription>
                                        </DialogHeader>

                                        <form onSubmit={handleAddressSubmit} className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="state">المحافظة *</Label>
                                                    <Select
                                                        value={addressForm.state}
                                                        onValueChange={(value) => setAddressForm(prev => ({ ...prev, state: value, city: '' }))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="اختر المحافظة" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {EGYPT_GOVERNORATES.map((gov) => (
                                                                <SelectItem key={gov.value} value={gov.value}>
                                                                    {gov.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="city">المدينة *</Label>
                                                    <Select
                                                        value={addressForm.city}
                                                        onValueChange={(value) => setAddressForm(prev => ({ ...prev, city: value }))}
                                                        disabled={!addressForm.state}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={addressForm.state ? "اختر المدينة" : "اختر المحافظة أولاً"} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {addressForm.state && EGYPT_GOVERNORATES
                                                                .find(g => g.value === addressForm.state)
                                                                ?.cities.map((city) => (
                                                                    <SelectItem key={city} value={city}>
                                                                        {city}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="district">الحي/المنطقة *</Label>
                                                    <Input
                                                        id="district"
                                                        value={addressForm.district}
                                                        onChange={(e) => setAddressForm(prev => ({ ...prev, district: e.target.value }))}
                                                        placeholder="اسم الحي أو المنطقة"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="street">الشارع *</Label>
                                                    <Input
                                                        id="street"
                                                        value={addressForm.street}
                                                        onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                                                        placeholder="اسم الشارع"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="buildingNumber">رقم العمارة</Label>
                                                    <Input
                                                        id="buildingNumber"
                                                        value={addressForm.buildingNumber}
                                                        onChange={(e) => setAddressForm(prev => ({ ...prev, buildingNumber: e.target.value }))}
                                                        placeholder="رقم العمارة"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="apartmentNumber">رقم الشقة</Label>
                                                    <Input
                                                        id="apartmentNumber"
                                                        value={addressForm.apartmentNumber}
                                                        onChange={(e) => setAddressForm(prev => ({ ...prev, apartmentNumber: e.target.value }))}
                                                        placeholder="رقم الشقة"
                                                    />
                                                </div>

                                                <div className="md:col-span-2 space-y-2">
                                                    <Label htmlFor="landmark">علامة مميزة</Label>
                                                    <Input
                                                        id="landmark"
                                                        value={addressForm.landmark}
                                                        onChange={(e) => setAddressForm(prev => ({ ...prev, landmark: e.target.value }))}
                                                        placeholder="مقابل، بجوار، خلف..."
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="label">نوع العنوان</Label>
                                                    <Select
                                                        value={addressForm.label}
                                                        onValueChange={(value) => setAddressForm(prev => ({ ...prev, label: value }))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="اختر النوع" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="home">منزل</SelectItem>
                                                            <SelectItem value="work">عمل</SelectItem>
                                                            <SelectItem value="other">أخرى</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 space-x-reverse pt-4">
                                                <input
                                                    type="checkbox"
                                                    id="isDefault"
                                                    checked={addressForm.isDefault}
                                                    onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                                                    className="h-4 w-4 rounded border-gray-300"
                                                />
                                                <Label htmlFor="isDefault" className="text-sm">
                                                    تعيين كعنوان افتراضي
                                                </Label>
                                            </div>
                                        </form>

                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsDialogOpen(false);
                                                    setAddressForm({ ...INITIAL_ADDRESS_FORM });
                                                    setEditingAddressId(null);
                                                }}
                                            >
                                                إلغاء
                                            </Button>
                                            <Button onClick={handleAddressSubmit} disabled={addressLoading}>
                                                {addressLoading ? (
                                                    <>
                                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                        جاري الحفظ...
                                                    </>
                                                ) : editingAddressId ? 'تحديث العنوان' : 'إضافة العنوان'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                {/* Delete Address Dialog */}
                                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>حذف العنوان</DialogTitle>
                                            <DialogDescription>
                                                هل أنت متأكد من حذف هذا العنوان؟ لا يمكن التراجع عن هذا الإجراء.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsDeleteDialogOpen(false);
                                                    setAddressToDelete(null);
                                                }}
                                            >
                                                إلغاء
                                            </Button>
                                            <Button variant="destructive" onClick={handleDeleteAddress}>
                                                حذف
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}

                        {/* Security & Password */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Lock className="h-5 w-5" />
                                            تغيير كلمة المرور
                                        </CardTitle>
                                        <CardDescription>
                                            قم بتحديث كلمة المرور الخاصة بك لتأمين حسابك
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handlePasswordChange} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="currentPassword"
                                                        type={showPassword.current ? "text" : "password"}
                                                        value={passwordForm.currentPassword}
                                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                        placeholder="أدخل كلمة المرور الحالية"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute left-2 top-1/2 transform -translate-y-1/2"
                                                        onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                                                    >
                                                        {showPassword.current ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="newPassword"
                                                        type={showPassword.new ? "text" : "password"}
                                                        value={passwordForm.newPassword}
                                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                        placeholder="كلمة المرور الجديدة (8 أحرف على الأقل)"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute left-2 top-1/2 transform -translate-y-1/2"
                                                        onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                                                    >
                                                        {showPassword.new ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                                {passwordForm.newPassword && (
                                                    <div className="space-y-2">
                                                        <Progress
                                                            value={calculatePasswordStrength(passwordForm.newPassword)}
                                                            className="h-2"
                                                        />
                                                        <p className="text-xs text-gray-500">
                                                            قوة كلمة المرور: {calculatePasswordStrength(passwordForm.newPassword)}%
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="confirmPassword"
                                                        type={showPassword.confirm ? "text" : "password"}
                                                        value={passwordForm.confirmPassword}
                                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                        placeholder="أعد إدخال كلمة المرور الجديدة"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute left-2 top-1/2 transform -translate-y-1/2"
                                                        onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                    >
                                                        {showPassword.confirm ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                                                    <p className="text-sm text-destructive">كلمة المرور غير متطابقة</p>
                                                )}
                                            </div>

                                            {passwordError && (
                                                <Alert variant="destructive">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>{passwordError}</AlertDescription>
                                                </Alert>
                                            )}

                                            <Button type="submit" className="w-full" disabled={passwordLoading}>
                                                {passwordLoading ? (
                                                    <>
                                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                        جاري التحديث...
                                                    </>
                                                ) : 'تغيير كلمة المرور'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ShieldCheck className="h-5 w-5" />
                                            نصائح الأمان
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3 text-sm">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span>استخدم كلمة مرور قوية تحتوي على أحرف وأرقام ورموز خاصة</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span>لا تستخدم كلمة المرور نفسها في أكثر من موقع</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span>غير كلمة المرور بانتظام (كل 3-6 أشهر)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span>تفعيل المصادقة الثنائية إن أمكن</span>
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Activity */}
                        {activeTab === 'activity' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        النشاطات الأخيرة
                                    </CardTitle>
                                    <CardDescription>
                                        سجل نشاطات حسابك
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg">ملخص النشاط</h3>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-600">تاريخ الإنشاء</p>
                                                    <p className="font-semibold">{formatDate(user?.createdAt)}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-600">آخر تحديث</p>
                                                    <p className="font-semibold">{formatDate(user?.updatedAt)}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-600">آخر تسجيل دخول</p>
                                                    <p className="font-semibold">{formatDate(user?.lastLogin)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <h3 className="font-semibold text-lg mb-4">سجل النشاطات</h3>
                                            <div className="space-y-4">
                                                {user?.loginHistory?.length > 0 ? (
                                                    user.loginHistory.slice(0, 10).map((login: any, index: number) => (
                                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                                    <User className="h-4 w-4 text-primary" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">تسجيل دخول</p>
                                                                    <p className="text-sm text-gray-600">
                                                                        {login.device} • {login.ipAddress}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-gray-600">
                                                                {formatDate(login.timestamp)}
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                        <p className="text-gray-600">لا توجد نشاطات مسجلة</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;