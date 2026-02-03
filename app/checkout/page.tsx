"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    orderService,
    addressService,
    cartService,
    pickupPointService,
    paymentService
} from '@/lib/api'
import { useAuth } from "@/contexts/AuthProvider"
import { useLanguage } from "@/components/language-provider"
import { toast } from 'sonner'
import {
    Loader2,
    MapPin,
    Plus,
    Home,
    Building,
    User,
    Phone,
    Check,
    X,
    Package,
    CreditCard,
    Wallet,
    Truck,
    ShoppingBag,
    AlertCircle,
    CheckCircle,
    Shield,
    Lock,
    ArrowRight,
    Clock
} from 'lucide-react'
import Image from 'next/image'

// مكون عنصر الخطوة في عملية الدفع
interface CheckoutStepProps {
  number: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

const CheckoutStep: React.FC<CheckoutStepProps> = ({ number, title, description, isActive, isCompleted, icon: Icon }) => (
    <div className={`flex items-center space-x-4 p-3 rounded-lg transition-all ${isActive ? 'bg-primary/10 border border-primary/20' : ''}`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
            {isCompleted ? <Check className="h-5 w-5" /> : (Icon ? <Icon className="h-5 w-5" /> : <span className="font-semibold">{number}</span>)}
        </div>
        <div className="flex-1">
            <h3 className={`font-semibold ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                {title}
            </h3>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    </div>
)

export default function Checkout() {
    const router = useRouter()
    const { user, cookiesReady } = useAuth()
    const { language } = useLanguage()

    // 1️⃣ جميع تعريفات state أولاً
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<string>('cash')
    const [deliveryMethod, setDeliveryMethod] = useState('home')
    const [selectedAddressId, setSelectedAddressId] = useState<string>('')
    const [showNewAddressForm, setShowNewAddressForm] = useState(false)
    const [pickupPointId, setPickupPointId] = useState('')
    const [walletPhone, setWalletPhone] = useState('')
    const [showWalletPhoneInput, setShowWalletPhoneInput] = useState(false)
    const [activeStep, setActiveStep] = useState(1)

    // ⭐ تعريف recipientInfo هنا قبل أي useEffect يستخدمه
    const [recipientInfo, setRecipientInfo] = useState({
        fullName: '',
        phoneNumber: '',
        useAccountInfo: false
    })

    const [paymobFrameUrl, setPaymobFrameUrl] = useState('')
    const [createdOrderId, setCreatedOrderId] = useState('')
    const [pickupPoints, setPickupPoints] = useState<any[]>([])
    const [addresses, setAddresses] = useState<any[]>([])
    const [cartItems, setCartItems] = useState<any[]>([])
    const [subtotal, setSubtotal] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [shippingFee, setShippingFee] = useState(0)
    const [total, setTotal] = useState(0)
    const [estimatedDelivery, setEstimatedDelivery] = useState(language === 'ar' ? '2-4 أيام' : '2-4 days')
console.log(user,'user454')
    const [newAddress, setNewAddress] = useState({
        address: '',
        city: '',
        state: '',
        district: '',
        street: '',
        addressType: '',
        isDefault: false
    })

    const [isMobile, setIsMobile] = useState(false)

    // 2️⃣ خطوات عملية الدفع (ثابتة)
    const checkoutSteps = useMemo(() => [
        {
            number: 1,
            title: language === 'ar' ? 'معلومات المستلم' : 'Recipient Info',
            description: language === 'ar' ? 'أدخل بيانات المستلم' : 'Enter recipient details',
            icon: User
        },
        {
            number: 2,
            title: language === 'ar' ? 'طريقة التوصيل' : 'Delivery Method',
            description: language === 'ar' ? 'اختر كيفية الاستلام' : 'Choose delivery option',
            icon: Truck
        },
        {
            number: 3,
            title: language === 'ar' ? 'طريقة الدفع' : 'Payment Method',
            description: language === 'ar' ? 'اختر طريقة الدفع' : 'Select payment method',
            icon: CreditCard
        }
    ], [language])

    // 3️⃣ الآن نضع useEffect بعد تعريف جميع states

    // تحديد الخطوة النشطة بناءً على الإجراءات
    useEffect(() => {
        if (recipientInfo.fullName && recipientInfo.phoneNumber) {
            if ((deliveryMethod === 'home' && (selectedAddressId || newAddress.address)) ||
                (deliveryMethod === 'pickup' && pickupPointId)) {
                setActiveStep(3)
            } else {
                setActiveStep(2)
            }
        } else {
            setActiveStep(1)
        }
    }, [recipientInfo, deliveryMethod, selectedAddressId, pickupPointId, newAddress.address])

    // Show wallet phone input when method is wallet
    useEffect(() => {
        setShowWalletPhoneInput(paymentMethod === 'wallet');
        if (paymentMethod === 'wallet' && user?.phone) {
            setWalletPhone(user.phone);
        }
    }, [paymentMethod, user])

    // أحجام الشاشة للتصميم المتجاوب
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Load user addresses and set default
    useEffect(() => {
        const loadAddresses = async () => {
            try {
                const res = await addressService.getAddresses()
                if (res?.data?.data) {
                    const loadedAddresses = res.data.data
                    setAddresses(loadedAddresses)

                    const defaultAddress = loadedAddresses.find((addr: any) => addr.isDefault)
                    if (defaultAddress) {
                        setSelectedAddressId(defaultAddress._id)
                        setRecipientInfo(prev => ({
                            ...prev,
                            fullName: defaultAddress.fullName || user?.firstName + ' ' + user?.lastName || '',
                            phoneNumber: defaultAddress.phoneNumber || user?.phone || ''
                        }))
                    } else if (user) {
                        setRecipientInfo(prev => ({
                            ...prev,
                            fullName: user.firstName + ' ' + user.lastName,
                            phoneNumber: user.phone || ''
                        }))
                        if (loadedAddresses.length > 0) {
                            setSelectedAddressId(loadedAddresses[0]._id)
                            const firstAddress = loadedAddresses[0]
                            setRecipientInfo(prev => ({
                                ...prev,
                                fullName:  user.firstName + ' ' + user.lastName,
                                phoneNumber:  user.phone || ''
                            }))
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load addresses:', err)
            }
        }
        if (user) {
            loadAddresses()
        }
    }, [user])

    // Load pickup points
    useEffect(() => {
        const loadPickupPoints = async () => {
            try {
                const res = await pickupPointService.getPickupPoints()
                const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
                setPickupPoints(list)
            } catch (err) {
                console.error('Failed to load pickup points:', err)
            }
        }
        loadPickupPoints()
    }, [])

    // Load cart and compute totals
    useEffect(() => {
        const loadCart = async () => {
            try {
                setLoadingData(true)
                const response = await cartService.getCart();
                const cart = response?.data || {}
                const items: any[] = Array.isArray(cart?.items) ? cart.items : []
                setCartItems(items)

                const sub = items.reduce((acc, item) => acc + ((item?.price ?? item?.product?.price ?? 0) * (item?.quantity ?? 1)), 0)
                const disc = Number(cart?.appliedCoupon?.discountAmount ?? 0)
                const ship = Number(cart?.shippingFee ?? (sub > 500 ? 0 : 30))
                const tot = Number(cart?.total ?? (sub - disc + ship))

                setSubtotal(sub)
                setDiscount(disc)
                setShippingFee(ship)
                setTotal(tot)

                // تحديث وقت التوصيل المتوقع
                if (sub > 500) {
                    setEstimatedDelivery(language === 'ar' ? '1-2 أيام' : '1-2 days')
                } else {
                    setEstimatedDelivery(language === 'ar' ? '2-4 أيام' : '2-4 days')
                }
            } catch (e: any) {
                console.error('Failed to load cart:', e)
                setError(e?.response?.data?.message || (language === 'ar' ? 'فشل تحميل السلة' : 'Failed to load cart'))
            } finally {
                setLoadingData(false)
            }
        }
        loadCart()
    }, [language])

    // 4️⃣ تعريف الدوال والوظائف المساعدة

    // Handle address selection
    const handleAddressSelect = useCallback((addressId: string) => {
        setSelectedAddressId(addressId)
        const selectedAddress = addresses.find(addr => addr._id === addressId)
        if (selectedAddress) {
            setRecipientInfo(prev => ({
                ...prev,
                fullName: selectedAddress.fullName || prev.fullName,
                phoneNumber: selectedAddress.phoneNumber || prev.phoneNumber
            }))
        }
    }, [addresses])

    // Handle recipient info change
    const handleRecipientInfoChange = useCallback((field: string, value: string) => {
        setRecipientInfo(prev => ({
            ...prev,
            [field]: value
        }))
    }, [])

    // Toggle use account info
    const toggleUseAccountInfo = useCallback(() => {
        if (!recipientInfo.useAccountInfo && user) {
            // Fill from account
            setRecipientInfo({
                fullName: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
                phoneNumber: user?.phone ?? '',
                useAccountInfo: true,
            });
        } else {
            // Clear fields when disabled
            setRecipientInfo({
                fullName: '',
                phoneNumber: '',
                useAccountInfo: false,
            });
        }
    }, [user, recipientInfo.useAccountInfo])

    // Handle new address form input change
    const handleNewAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setNewAddress(prev => ({
            ...prev,
            [name]: value
        }))
    }, [])

    // Handle address type change
    const handleAddressTypeChange = useCallback((type: string) => {
        setNewAddress(prev => ({
            ...prev,
            addressType: type
        }))
    }, [])

    // Save new address
    const handleSaveNewAddress = async () => {
        try {
            if (!newAddress.address.trim()) {
                toast.error(language === 'ar' ? 'العنوان مطلوب' : 'Address is required')
                return
            }

            // Include recipient info with the address
            const addressData = {
                ...newAddress,
                fullName: recipientInfo.fullName,
                phoneNumber: recipientInfo.phoneNumber
            }

            const response = await addressService.addAddress(addressData)
            if (response?.data?.data) {
                const savedAddress = response.data.data
                // Update addresses list
                const updatedAddresses = [...addresses, savedAddress]
                setAddresses(updatedAddresses)

                // Automatically select the newly created address
                setSelectedAddressId(savedAddress._id)

                // Close the form
                setShowNewAddressForm(false)

                // Reset form
                setNewAddress({
                    address: '',
                    city: '',
                    state: '',
                    district: '',
                    street: '',
                    addressType: 'home',
                    isDefault: false
                })

                toast.success(language === 'ar' ? 'تم حفظ العنوان بنجاح' : 'Address saved successfully')
            }
        } catch (err: any) {
            console.error('Failed to save address:', err)
            toast.error(err.response?.data?.message || (language === 'ar' ? 'فشل حفظ العنوان' : 'Failed to save address'))
        }
    }

    // Cancel new address form
    const handleCancelNewAddress = useCallback(() => {
        setShowNewAddressForm(false)
        setNewAddress({
            address: '',
            city: '',
            state: '',
            district: '',
            street: '',
            addressType: 'home',
            isDefault: false
        })
    }, [])

    // Get selected address details
    const getSelectedAddress = useCallback(() => {
        if (selectedAddressId) {
            return addresses.find(addr => addr._id === selectedAddressId)
        }
        return null
    }, [selectedAddressId, addresses])

    // Get address type icon
    const getAddressTypeIcon = useCallback((type: string) => {
        switch (type) {
            case 'home': return <Home className="h-4 w-4" />
            case 'work': return <Building className="h-4 w-4" />
            default: return <MapPin className="h-4 w-4" />
        }
    }, [])

    // Get address type text
    const getAddressTypeText = useCallback((type: string) => {
        switch (type) {
            case 'home': return language === 'ar' ? 'منزل' : 'Home'
            case 'work': return language === 'ar' ? 'عمل' : 'Work'
            default: return language === 'ar' ? 'أخرى' : 'Other'
        }
    }, [language])

    // Get payment method icon
    const getPaymentMethodIcon = useCallback((method: string) => {
        switch (method) {
            case 'card': return <CreditCard className="h-5 w-5" />
            case 'wallet': return <Wallet className="h-5 w-5" />
            case 'cash': return <Package className="h-5 w-5" />
            default: return <CreditCard className="h-5 w-5" />
        }
    }, [])

    // Get payment method description
    const getPaymentMethodDescription = useCallback((method: string) => {
        switch (method) {
            case 'card':
                return language === 'ar' ? 'دفع آمن عبر البطاقات البنكية' : 'Secure payment via bank cards'
            case 'wallet':
                return language === 'ar' ? 'دفع عبر المحافظ الإلكترونية' : 'Payment via digital wallets'
            case 'cash':
                return language === 'ar' ? 'دفع عند الاستلام' : 'Cash on delivery'
            default:
                return ''
        }
    }, [language])

    const handlePayment = async () => {
        try {
            setLoading(true)
            setError(null)
            setSuccess(false)

            const trimmedFullName = recipientInfo.fullName.trim()
            const trimmedPhone = recipientInfo.phoneNumber.trim()

            // Validate required fields
            if (!trimmedFullName) {
                throw new Error(language === 'ar' ? 'اسم المستلم مطلوب' : 'Recipient name is required')
            }
            if (!trimmedPhone) {
                throw new Error(language === 'ar' ? 'رقم هاتف المستلم مطلوب' : 'Recipient phone number is required')
            }

            // Check if cart items exist
            if (cartItems.length === 0) {
                throw new Error(language === 'ar' ? 'لا توجد منتجات في السلة' : 'No items in cart')
            }

            const selectedAddress = getSelectedAddress()
            let deliveryAddress = ''
            let pickupPointPayload: any = undefined

            if (deliveryMethod === 'home') {
                if (selectedAddress) {
                    const parts = [
                        selectedAddress.address || selectedAddress.addressLine1, // fallback if legacy field exists
                        selectedAddress.street,
                        selectedAddress.district,
                        selectedAddress.city,
                        selectedAddress.state || selectedAddress.governorate,
                    ].filter(Boolean)
                    deliveryAddress = parts.join(', ').trim()
                } else {
                    deliveryAddress = newAddress.address.trim()
                }

                if (!deliveryAddress) {
                    throw new Error(language === 'ar'
                        ? 'يرجى اختيار عنوان للتوصيل أو إضافة عنوان جديد'
                        : 'Please select or add a delivery address')
                }
            }

            if (deliveryMethod === 'pickup') {
                if (!pickupPointId) {
                    throw new Error(language === 'ar'
                        ? 'يرجى اختيار نقطة الاستلام'
                        : 'Please choose a pickup point')
                }

                pickupPointPayload = pickupPoints.find((point) => point?._id === pickupPointId || point?.id === pickupPointId) || pickupPointId
            }

            // Prepare order data
            const orderData = {
                deliveryMethod,
                paymentMethod,
                deliveryAddress: deliveryMethod === 'home' ? deliveryAddress : undefined,
                pickupPoint: deliveryMethod === 'pickup' ? pickupPointPayload : undefined,
                recipientInfo: {
                    fullName: trimmedFullName,
                    phoneNumber: trimmedPhone
                },
                subtotal,
                discount,
                shippingFee,
                total
            }

            // Create order
            const orderResponse = await orderService.createOrder(orderData);

            if (!orderResponse) {
                throw new Error(language === 'ar' ? 'فشل إنشاء الطلب' : 'Failed to create order')
            }

            const orderId = orderResponse.data.data?._id;
            if (!orderId) {
                throw new Error(language === 'ar' ? 'فشل الحصول على معرف الطلب' : 'Failed to get order ID')
            }

            setCreatedOrderId(orderId)

            if (paymentMethod === 'card') {
                // ---- CARD FLOW (iframe) ----
                // Create Paymob payment session
                const paymentResponse = await paymentService.createPaymentSession({
                    orderId: orderId,
                    paymentMethod: 'card'
                })

                if (!paymentResponse?.data.iframeUrl) {
                    throw new Error(language === 'ar' ? 'فشل إنشاء جلسة الدفع' : 'Failed to create payment session')
                }

                setPaymobFrameUrl(paymentResponse.data?.iframeUrl)

            } else {
                // For other payment methods (e.g., cash), show success and redirect
                setSuccess(true)
                toast.success(language === 'ar' ? 'تم إنشاء الطلب بنجاح' : 'Order created successfully')
                setTimeout(() => {
                    router.push("/orders")
                }, 2000)
            }
        } catch (err: any) {
            console.error('Payment error:', err)
            setError(err.response?.data?.message || err.message || (language === 'ar' ? 'فشل إنشاء الطلب' : 'Failed to create order'))
            toast.error(err.response?.data?.message || err.message || (language === 'ar' ? 'فشل إنشاء الطلب' : 'Failed to create order'))
        } finally {
            setLoading(false)
        }
    }

    // حساب نسبة إكمال الطلب
    const completionPercentage = useMemo(() => {
        let percentage = 0
        if (recipientInfo.fullName && recipientInfo.phoneNumber) percentage += 33
        if ((deliveryMethod === 'home' && (selectedAddressId || newAddress.address)) ||
            (deliveryMethod === 'pickup' && pickupPointId)) percentage += 33
        if (paymentMethod) percentage += 34
        return percentage
    }, [recipientInfo, deliveryMethod, selectedAddressId, newAddress.address, pickupPointId, paymentMethod])

    // 5️⃣ التصميم الرئيسي للصفحة

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header with progress */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {language === 'ar' ? 'إتمام الطلب' : 'Complete Your Order'}
                </h1>
                <p className="text-gray-600 mb-6">
                    {language === 'ar'
                        ? 'أكمل المعلومات التالية لإتمام طلبك'
                        : 'Complete the following information to finish your order'}
                </p>

                {/* Progress bar */}
                <div className="mb-6">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            {language === 'ar' ? 'تقدم الطلب' : 'Order Progress'}
                        </span>
                        <span className="text-sm font-medium text-primary">{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                </div>

                {/* Steps for desktop */}
                {!isMobile && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {checkoutSteps.map((step, index) => (
                            <CheckoutStep
                                key={step.number}
                                {...step}
                                isActive={activeStep === step.number}
                                isCompleted={activeStep > step.number}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Checkout Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Step 1: Recipient Information */}
                    <Card className={`transition-all ${activeStep >= 1 ? 'opacity-100' : 'opacity-60'}`}>
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {activeStep > 1 ? <Check className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {language === 'ar' ? 'معلومات المستلم' : 'Recipient Information'}
                                        </CardTitle>
                                        <CardDescription>
                                            {language === 'ar'
                                                ? 'أدخل بيانات الشخص الذي سيستلم الطلب'
                                                : 'Enter details of the person receiving the order'}
                                        </CardDescription>
                                    </div>
                                </div>
                                {activeStep > 1 && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {language === 'ar' ? 'مكتمل' : 'Completed'}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {language === 'ar' ? 'اسم المستلم' : 'Recipient Name'} *
                                    </Label>
                                    <Input
                                        id="fullName"
                                        value={recipientInfo.fullName}
                                        onChange={(e) => handleRecipientInfoChange('fullName', e.target.value)}
                                        placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full name'}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
                                    </Label>
                                    <Input
                                        id="phoneNumber"
                                        type="tel"
                                        value={recipientInfo.phoneNumber}
                                        onChange={(e) => handleRecipientInfoChange('phoneNumber', e.target.value)}
                                        placeholder="01XXXXXXXXX"
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            {user && (
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="useAccountInfo"
                                        checked={recipientInfo.useAccountInfo}
                                        onChange={toggleUseAccountInfo}
                                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="useAccountInfo" className="cursor-pointer text-sm flex-1">
                                        <span className="font-medium">
                                            {language === 'ar' ? 'استخدام بيانات حسابي' : 'Use my account information'}
                                        </span>
                                        <p className="text-gray-600 mt-1">
                                            {language === 'ar'
                                                ? 'سيتم تعبئة البيانات تلقائياً من حسابك'
                                                : 'Information will be auto-filled from your account'}
                                        </p>
                                    </Label>
                                </div>
                            )}

                            {recipientInfo.fullName && recipientInfo.phoneNumber && (
                                <Button
                                    onClick={() => setActiveStep(2)}
                                    className="w-full md:w-auto"
                                    variant="default"
                                >
                                    {language === 'ar' ? 'متابعة للتوصيل' : 'Continue to Delivery'}
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Step 2: Delivery Method */}
                    <Card className={`transition-all ${activeStep >= 2 ? 'opacity-100' : 'opacity-60'}`}>
                        <CardHeader className="bg-gradient-to-r from-green-50 to-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {activeStep > 2 ? <Check className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <CardTitle>
                                            {language === 'ar' ? 'طريقة التوصيل' : 'Delivery Method'}
                                        </CardTitle>
                                        <CardDescription>
                                            {language === 'ar'
                                                ? 'اختر كيفية استلام طلبك'
                                                : 'Choose how you want to receive your order'}
                                        </CardDescription>
                                    </div>
                                </div>
                                {activeStep > 2 && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {language === 'ar' ? 'مكتمل' : 'Completed'}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Delivery Method Toggle */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${deliveryMethod === 'home' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                                    onClick={() => setDeliveryMethod('home')}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-full ${deliveryMethod === 'home' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                                            <Home className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{language === 'ar' ? 'التوصيل للمنزل' : 'Home Delivery'}</h3>
                                            <p className="text-sm text-gray-600">
                                                {language === 'ar' ? 'توصيل إلى عنوانك' : 'Delivery to your address'}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {language === 'ar'
                                            ? 'سيصل طلبك خلال 2-4 أيام عمل'
                                            : 'Your order will arrive in 2-4 business days'}
                                    </p>
                                </div>

                                <div
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${deliveryMethod === 'pickup' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                                    onClick={() => setDeliveryMethod('pickup')}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-full ${deliveryMethod === 'pickup' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{language === 'ar' ? 'استلام من نقطة' : 'Pickup Point'}</h3>
                                            <p className="text-sm text-gray-600">
                                                {language === 'ar' ? 'استلام من أقرب نقطة' : 'Pickup from nearest point'}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {language === 'ar'
                                            ? 'استلام مجاني خلال 24 ساعة'
                                            : 'Free pickup within 24 hours'}
                                    </p>
                                </div>
                            </div>

                            {deliveryMethod === 'home' && (
                                <div className="space-y-4">
                                    {!showNewAddressForm && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-base font-medium">
                                                    {language === 'ar' ? 'اختر عنوان التوصيل' : 'Select Delivery Address'}
                                                </Label>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowNewAddressForm(true)}
                                                    className="gap-1"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    {language === 'ar' ? 'إضافة عنوان جديد' : 'Add New Address'}
                                                </Button>
                                            </div>

                                            {addresses.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {addresses.map((address) => (
                                                        <div
                                                            key={address._id}
                                                            className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedAddressId === address._id
                                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                            onClick={() => handleAddressSelect(address._id)}
                                                        >
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    {getAddressTypeIcon(address.addressType)}
                                                                    <span className="font-medium truncate">
                                                                        {address.fullName || language === 'ar' ? 'عنوان' : 'Address'}
                                                                    </span>
                                                                </div>
                                                                {address.isDefault && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {language === 'ar' ? 'افتراضي' : 'Default'}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                                {address.address}
                                                                {address.city && `, ${address.city}`}
                                                                {address.state && `, ${address.state}`}
                                                            </p>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {address.phoneNumber}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Alert>
                                                    <MapPin className="h-4 w-4" />
                                                    <AlertTitle>
                                                        {language === 'ar' ? 'لا توجد عناوين' : 'No addresses'}
                                                    </AlertTitle>
                                                    <AlertDescription>
                                                        {language === 'ar'
                                                            ? 'يجب إضافة عنوان للتوصيل أولاً'
                                                            : 'You need to add a delivery address first'}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    )}

                                    {/* New Address Form */}
                                    {showNewAddressForm && (
                                        <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-lg">
                                                    {language === 'ar' ? 'إضافة عنوان جديد' : 'Add New Address'}
                                                </h3>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleCancelNewAddress}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2">
                                                    <Label htmlFor="address">{language === 'ar' ? 'العنوان' : 'Address'} *</Label>
                                                    <Textarea
                                                        id="address"
                                                        name="address"
                                                        value={newAddress.address}
                                                        onChange={handleNewAddressChange}
                                                        placeholder={language === 'ar' ? 'الشارع، المنطقة، المدينة' : 'Street, Area, City'}
                                                        className="min-h-[80px]"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="city">{language === 'ar' ? 'المدينة' : 'City'}</Label>
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        value={newAddress.city}
                                                        onChange={handleNewAddressChange}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="district">{language === 'ar' ? 'الحي' : 'District'}</Label>
                                                    <Input
                                                        id="district"
                                                        name="district"
                                                        value={newAddress.district}
                                                        onChange={handleNewAddressChange}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="street">{language === 'ar' ? 'الشارع' : 'Street'}</Label>
                                                    <Input
                                                        id="street"
                                                        name="street"
                                                        value={newAddress.street}
                                                        onChange={handleNewAddressChange}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="state">{language === 'ar' ? 'المحافظة' : 'State/Province'}</Label>
                                                    <Input
                                                        id="state"
                                                        name="state"
                                                        value={newAddress.state}
                                                        onChange={handleNewAddressChange}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label>{language === 'ar' ? 'نوع العنوان' : 'Address Type'}</Label>
                                                <div className="flex gap-2">
                                                    {['home', 'work', 'other'].map((type) => (
                                                        <Button
                                                            key={type}
                                                            type="button"
                                                            variant={newAddress.addressType === type ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => handleAddressTypeChange(type)}
                                                            className="flex-1"
                                                        >
                                                            {type === 'home' && <Home className="h-4 w-4 mr-2" />}
                                                            {type === 'work' && <Building className="h-4 w-4 mr-2" />}
                                                            {type === 'other' && <MapPin className="h-4 w-4 mr-2" />}
                                                            {type === 'home' ? (language === 'ar' ? 'منزل' : 'Home') :
                                                                type === 'work' ? (language === 'ar' ? 'عمل' : 'Work') :
                                                                    (language === 'ar' ? 'أخرى' : 'Other')}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 p-3 bg-white rounded border">
                                                <input
                                                    type="checkbox"
                                                    id="isDefault"
                                                    checked={newAddress.isDefault}
                                                    onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <Label htmlFor="isDefault" className="cursor-pointer">
                                                    {language === 'ar' ? 'تعيين كعنوان افتراضي' : 'Set as default address'}
                                                </Label>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    type="button"
                                                    onClick={handleSaveNewAddress}
                                                    className="flex-1"
                                                    disabled={!newAddress.address.trim()}
                                                >
                                                    <Check className="h-4 w-4 mr-2" />
                                                    {language === 'ar' ? 'حفظ العنوان' : 'Save Address'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleCancelNewAddress}
                                                    className="flex-1"
                                                >
                                                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {deliveryMethod === 'pickup' && (
                                <div className="space-y-4">
                                    <Label className="text-base font-medium">
                                        {language === 'ar' ? 'اختر نقطة الاستلام' : 'Select Pickup Point'} *
                                    </Label>
                                    <Select value={pickupPointId} onValueChange={setPickupPointId}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder={language === 'ar' ? 'اختر نقطة الاستلام' : 'Select pickup point'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pickupPoints.map((point: any) => (
                                                <SelectItem key={point._id} value={point._id} className="py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {language === 'ar' ? (point.nameAr || point.name) : (point.nameEn || point.name)}
                                                        </span>
                                                        <span className="text-sm text-gray-500 mt-1">
                                                            {point.address}
                                                        </span>
                                                        <span className="text-xs text-gray-400 mt-1">
                                                            {language === 'ar' ? 'ساعات العمل: ' : 'Working hours: '}
                                                            {point.workingHours || '9 AM - 5 PM'}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {pickupPointId && (
                                        <Alert className="bg-blue-50 border-blue-200">
                                            <MapPin className="h-4 w-4 text-blue-600" />
                                            <AlertTitle className="text-blue-800">
                                                {language === 'ar' ? 'معلومات الاستلام' : 'Pickup Information'}
                                            </AlertTitle>
                                            <AlertDescription className="text-blue-700">
                                                {language === 'ar'
                                                    ? 'سيتم إشعارك عند وصول الطلب إلى نقطة الاستلام. الرجاء إحضار هويتك عند الاستلام.'
                                                    : 'You will be notified when your order arrives at the pickup point. Please bring your ID for collection.'}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            )}

                            {(selectedAddressId || newAddress.address || (deliveryMethod === 'pickup' && pickupPointId)) && (
                                <Button
                                    onClick={() => setActiveStep(3)}
                                    className="w-full md:w-auto"
                                    variant="default"
                                >
                                    {language === 'ar' ? 'متابعة للدفع' : 'Continue to Payment'}
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Step 3: Payment Method */}
                    <Card className={`transition-all ${activeStep >= 3 ? 'opacity-100' : 'opacity-60'}`}>
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle>
                                            {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                                        </CardTitle>
                                        <CardDescription>
                                            {language === 'ar'
                                                ? 'اختر طريقة الدفع المناسبة'
                                                : 'Choose your preferred payment method'}
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-green-600" />
                                    <span className="text-sm text-green-600 font-medium">
                                        {language === 'ar' ? 'دفع آمن' : 'Secure Payment'}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Payment Method Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {['cash', 'wallet', 'card'].map((method) => (
                                    <div
                                        key={method}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === method
                                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                            : 'border-gray-200 hover:border-gray-300'}`}
                                        onClick={() => setPaymentMethod(method)}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`p-2 rounded-full ${paymentMethod === method ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                                                {getPaymentMethodIcon(method)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">
                                                    {method === 'cash' ? (language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery') :
                                                        method === 'wallet' ? (language === 'ar' ? 'محفظة إلكترونية' : 'Digital Wallet') :
                                                            (language === 'ar' ? 'بطاقة بنكية' : 'Bank Card')}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {getPaymentMethodDescription(method)}
                                                </p>
                                            </div>
                                        </div>
                                        {method === 'cash' && (
                                            <Badge variant="secondary" className="mt-2">
                                                {language === 'ar' ? 'الأكثر شيوعاً' : 'Most Popular'}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Wallet Phone Input */}
                            {showWalletPhoneInput && (
                                <div className="p-4 border rounded-lg bg-blue-50/50">
                                    <Label htmlFor="walletPhone" className="flex items-center gap-2 mb-2">
                                        <Wallet className="h-4 w-4" />
                                        {language === 'ar' ? 'رقم الهاتف للمحفظة' : 'Wallet Phone Number'} *
                                    </Label>
                                    <Input
                                        id="walletPhone"
                                        type="tel"
                                        value={walletPhone}
                                        onChange={(e) => setWalletPhone(e.target.value)}
                                        placeholder="01XXXXXXXXX"
                                        className="h-11"
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        {language === 'ar'
                                            ? 'سيتم تحويلك إلى بوابة الدفع الخاصة بمزود المحفظة'
                                            : 'You will be redirected to your wallet provider\'s payment gateway'}
                                    </p>
                                </div>
                            )}

                            {/* Security Notice */}
                            <Alert className="bg-gray-50 border-gray-200">
                                <Lock className="h-4 w-4" />
                                <AlertTitle className="text-gray-800">
                                    {language === 'ar' ? 'دفع آمن بنسبة 100%' : '100% Secure Payment'}
                                </AlertTitle>
                                <AlertDescription className="text-gray-600">
                                    {language === 'ar'
                                        ? 'بياناتك محمية بتقنيات تشفير متقدمة. نحن لا نخزن بيانات بطاقتك.'
                                        : 'Your data is protected by advanced encryption. We do not store your card details.'}
                                </AlertDescription>
                            </Alert>

                            {/* Error/Success Messages */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>{language === 'ar' ? 'خطأ' : 'Error'}</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {success && (
                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertTitle className="text-green-800">
                                        {language === 'ar' ? 'تم بنجاح!' : 'Success!'}
                                    </AlertTitle>
                                    <AlertDescription className="text-green-700">
                                        {language === 'ar'
                                            ? 'تم إنشاء طلبك بنجاح. جاري تحويلك إلى صفحة الطلبات...'
                                            : 'Your order has been created successfully. Redirecting to orders page...'}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Order Summary Preview */}
                            <div className="p-4 border rounded-lg bg-gray-50">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold">
                                        {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                                    </h4>
                                    <Badge variant="outline" className="gap-1">
                                        <Clock className="h-3 w-3" />
                                        {estimatedDelivery}
                                    </Badge>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>{language === 'ar' ? 'الإجمالي الفرعي' : 'Subtotal'}</span>
                                        <span>{subtotal.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>{language === 'ar' ? 'الخصم' : 'Discount'}</span>
                                            <span className="font-medium">-{discount.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>{language === 'ar' ? 'الشحن' : 'Shipping'}</span>
                                        <span>{shippingFee === 0 ? (
                                            <span className="text-green-600 font-medium">
                                                {language === 'ar' ? 'مجاناً' : 'FREE'}
                                            </span>
                                        ) : (
                                            `${shippingFee.toFixed(2)} ${language === 'ar' ? 'ج.م' : 'EGP'}`
                                        )}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between text-base font-bold">
                                        <span>{language === 'ar' ? 'الإجمالي النهائي' : 'Total Amount'}</span>
                                        <span className="text-primary">
                                            {total.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Complete Order Button */}
                            <Button
                                onClick={handlePayment}
                                disabled={
                                    loading ||
                                    !recipientInfo.fullName ||
                                    !recipientInfo.phoneNumber ||
                                    (deliveryMethod === 'home' && !selectedAddressId && !newAddress.address) ||
                                    (deliveryMethod === 'pickup' && !pickupPointId) ||
                                    cartItems.length === 0 ||
                                    (paymentMethod === 'wallet' && !walletPhone)
                                }
                                className="w-full h-12 text-base font-semibold"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        {language === 'ar' ? 'جاري إنشاء الطلب...' : 'Creating Order...'}
                                    </>
                                ) : (
                                    <>
                                        {language === 'ar' ? 'إتمام الطلب والدفع' : 'Complete Order & Pay'}
                                        <Lock className="h-4 w-4 mr-2" />
                                    </>
                                )}
                            </Button>

                            {/* Terms Agreement */}
                            <p className="text-center text-xs text-gray-500">
                                {language === 'ar'
                                    ? 'بالنقر على "إتمام الطلب"، فإنك توافق على '
                                    : 'By clicking "Complete Order", you agree to our '}
                                <a href="/terms" className="text-primary hover:underline">
                                    {language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
                                </a>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Paymob Payment Frame */}
                    {paymobFrameUrl && (
                        <Card>
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-white">
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    {language === 'ar' ? 'إتمام الدفع' : 'Complete Payment'}
                                </CardTitle>
                                <CardDescription>
                                    {language === 'ar'
                                        ? 'أكمل عملية الدفع عبر البوابة الآمنة'
                                        : 'Complete your payment through the secure gateway'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-yellow-800 mb-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="font-medium">
                                            {language === 'ar' ? 'معلومة هامة' : 'Important Notice'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-yellow-700">
                                        {language === 'ar'
                                            ? 'لا تغلق هذه الصفحة حتى تكمل عملية الدفع. سيتم إعادة توجيهك تلقائياً بعد اكتمال الدفع.'
                                            : 'Do not close this page until you complete the payment. You will be automatically redirected after payment completion.'}
                                    </p>
                                </div>
                                <iframe
                                    src={paymobFrameUrl}
                                    width="100%"
                                    height="600"
                                    frameBorder="0"
                                    className="rounded-lg shadow-lg"
                                    title="Paymob Payment"
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6 shadow-lg border-gray-200">
                        <CardHeader className="bg-gradient-to-r from-primary/10 to-white border-b">
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-primary" />
                                {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Cart Items */}
                            <div className="p-4 border-b">
                                <h3 className="font-semibold mb-3">
                                    {language === 'ar' ? 'المنتجات' : 'Products'} ({cartItems.length})
                                </h3>
                                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                                    {loadingData ? (
                                        // Loading skeletons
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="flex items-start gap-3 pb-3">
                                                <Skeleton className="w-16 h-16 rounded" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-3 w-2/3" />
                                                    <Skeleton className="h-4 w-1/3" />
                                                </div>
                                            </div>
                                        ))
                                    ) : cartItems.length > 0 ? (
                                        cartItems.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                                                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                                    {item.product?.images?.[0] ? (
                                                        <Image
                                                            src={item.product.images[0]}
                                                            alt={language === 'ar' ? item.product?.title : item.product?.titleEn}
                                                            fill
                                                            className="object-cover"
                                                            sizes="64px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                            <Package className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                    {item.quantity > 1 && (
                                                        <div className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                            {item.quantity}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate">
                                                        {language === 'ar' ? item.product?.title : item.product?.titleEn}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                                        {item.colors?.length > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <div
                                                                    className="w-3 h-3 rounded-full border"
                                                                    style={{ backgroundColor: item.colors[0] }}
                                                                />
                                                                <span>{item.colors[0]}</span>
                                                            </div>
                                                        )}
                                                        {item.sizes?.length > 0 && (
                                                            <div>{language === 'ar' ? 'المقاس' : 'Size'}: {item.sizes[0]}</div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-sm text-gray-600">
                                                            {item.quantity} × {(item.price || item.product?.price || 0).toFixed(2)}
                                                        </span>
                                                        <span className="font-semibold">
                                                            {((item.price || item.product?.price || 0) * (item.quantity || 1)).toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                            <p>{language === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Totals */}
                            <div className="p-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{language === 'ar' ? 'الإجمالي الفرعي' : 'Subtotal'}</span>
                                        <span>{subtotal.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>{language === 'ar' ? 'الخصم' : 'Discount'}</span>
                                            <span className="font-medium">-{discount.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{language === 'ar' ? 'الشحن' : 'Shipping'}</span>
                                        <span>{shippingFee === 0 ? (
                                            <span className="text-green-600 font-medium">
                                                {language === 'ar' ? 'مجاناً' : 'FREE'}
                                            </span>
                                        ) : (
                                            `${shippingFee.toFixed(2)} ${language === 'ar' ? 'ج.م' : 'EGP'}`
                                        )}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold pt-1">
                                        <span>{language === 'ar' ? 'الإجمالي النهائي' : 'Total'}</span>
                                        <span className="text-primary">
                                            {total.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}
                                        </span>
                                    </div>
                                </div>

                                {/* Savings Info */}
                                {discount > 0 && (
                                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-2 text-green-700">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                {language === 'ar' ? 'وفرت' : 'You Saved'}
                                            </span>
                                        </div>
                                        <p className="text-green-600 text-lg font-bold mt-1">
                                            {discount.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}
                                        </p>
                                    </div>
                                )}

                                {/* Delivery Estimate */}
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 text-blue-700 mb-1">
                                        <Truck className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            {language === 'ar' ? 'التوصيل المتوقع' : 'Estimated Delivery'}
                                        </span>
                                    </div>
                                    <p className="text-blue-600 text-sm">
                                        {deliveryMethod === 'home'
                                            ? (language === 'ar'
                                                ? `التوصيل خلال ${estimatedDelivery}`
                                                : `Delivery in ${estimatedDelivery}`)
                                            : (language === 'ar'
                                                ? 'الاستلام خلال 24 ساعة'
                                                : 'Pickup within 24 hours')}
                                    </p>
                                </div>

                                {/* Need Help */}
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-600 mb-2">
                                        {language === 'ar' ? 'تحتاج مساعدة؟' : 'Need help?'}
                                    </p>
                                    <Button variant="link" size="sm" className="text-primary">
                                        {language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Badges */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="p-3 bg-gray-50 rounded-lg border text-center">
                            <Lock className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">
                                {language === 'ar' ? 'دفع آمن' : 'Secure Payment'}
                            </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border text-center">
                            <Shield className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">
                                {language === 'ar' ? 'خصوصية مضمونة' : 'Privacy Guaranteed'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}