'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/components/language-provider";
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { notificationService, userService } from "@/lib/api"
import { Search, Users, Store, User, X, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { MirvoryPageLoader } from "@/components/MirvoryLoader"

type NotificationTarget = 'all_users' | 'specific_users' | 'all_sellers' | 'specific_sellers'

interface User {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    role: 'user' | 'seller'
}

export default function NotificationsPage() {
    const { language } = useLanguage()
    const isArabic = language === "ar"
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [target, setTarget] = useState<NotificationTarget>("all_users")
    const [userIds, setUserIds] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<User[]>([])
    const [selectedUsers, setSelectedUsers] = useState<User[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [allUsers, setAllUsers] = useState<User[]>([])
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (target === "specific_users" || target === "specific_sellers") {
            fetchAllUsers()
        }
    }, [target])

    // جلب جميع المستخدمين حسب الدور
    const fetchAllUsers = async () => {
        setIsLoadingUsers(true)
        try {
            const role = target === "specific_users" ? 'user' : 'seller'

            // استخدام الدالة الصحيحة بناءً على الدور
            let response;
            if (role === 'user') {
                response = await userService.getUserForAdmin();
            } else {
                response = await userService.getSellerForAdmin();
            }

            // استخراج البيانات من الاستجابة
            const users = response.data || response;
            //console.log('Fetched users:', users);

            // تصفية البيانات للتأكد من أنها تطابق واجهة User
            const filteredUsers = users
                .filter((user: any) => user.role === role)
                .map((user: any) => ({
                    _id: user._id || user.id,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    role: user.role
                }));

            setAllUsers(filteredUsers)
        } catch (error: any) {
            console.error('Error fetching users:', error)
            toast.error(isArabic ? "فشل في جلب المستخدمين" : "Failed to fetch users")
        } finally {
            setIsLoadingUsers(false)
        }
    }

    // البحث عن المستخدمين
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            // إذا كان البحث فارغاً، اعرض جميع المستخدمين
            setHasSearched(false)
            fetchAllUsers()
            return
        }

        setIsSearching(true)
        setHasSearched(true)
        try {
            const role = target === "specific_users" ? 'user' : 'seller'
            const response = await userService.searchUsers(searchQuery, role)

            // معالجة الاستجابة بشكل صحيح
            let results;
            if (response.data && response.data.data) {
                results = response.data.data; // إذا كان الهيكل { data: { data: [...] } }
            } else if (response.data) {
                results = response.data; // إذا كان الهيكل { data: [...] }
            } else {
                results = response; // إذا كان الاستجابة مباشرة
            }

            //console.log('Search results:', results)

            // التأكد من أن results هي مصفوفة
            const resultsArray = Array.isArray(results) ? results : [];

            // تصفية البيانات
            const filteredResults = resultsArray.map((user: any) => ({
                _id: user._id || user.id,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role
            }));

            setSearchResults(filteredResults)
        } catch (error: any) {
            console.error('Error searching users:', error)
            toast.error(isArabic ? "فشل في البحث" : "Search failed")
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }

    // إضافة مستخدم إلى القائمة المختارة
    const handleAddUser = (user: User) => {
        if (!selectedUsers.find(u => u._id === user._id)) {
            const updatedSelectedUsers = [...selectedUsers, user];
            setSelectedUsers(updatedSelectedUsers)
            setUserIds(updatedSelectedUsers.map(u => u._id).join(','))
        }
    }

    // إزالة مستخدم من القائمة المختارة
    const handleRemoveUser = (userId: string) => {
        const updatedSelectedUsers = selectedUsers.filter(u => u._id !== userId)
        setSelectedUsers(updatedSelectedUsers)
        setUserIds(updatedSelectedUsers.map(u => u._id).join(','))
    }

    // البحث عند الضغط على Enter
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearch()
        }
    }

    // إعادة تعيين عند تغيير الهدف
    useEffect(() => {
        setSearchQuery("")
        setSearchResults([])
        setSelectedUsers([])
        setUserIds("")
        setAllUsers([])
        setHasSearched(false)
    }, [target])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if ((target === "specific_users" || target === "specific_sellers") && selectedUsers.length === 0) {
            toast.error(isArabic ? "يرجى اختيار مستخدمين على الأقل" : "Please select at least one user")
            return
        }

        setIsSending(true)

        try {
            let notificationData: {
                title: string
                message: string
                type: string
                userIds?: string[]
                role?: 'seller' | 'user'
            } = {
                title,
                message,
                type: 'CUSTOM'
            }

            // Set the appropriate data based on the target
            switch (target) {
                case 'all_users':
                    notificationData.role = 'user'
                    notificationData.type = 'ALL_USERS'
                    break
                case 'specific_users':
                    notificationData.userIds = selectedUsers.map(user => user._id)
                    notificationData.role = 'user'
                    break
                case 'all_sellers':
                    notificationData.role = 'seller'
                    notificationData.type = 'ALL_USERS'
                    break
                case 'specific_sellers':
                    notificationData.userIds = selectedUsers.map(user => user._id)
                    notificationData.role = 'seller'
                    break
            }

            await notificationService.sendNotification(notificationData)
            toast.success(isArabic ? "تم إرسال الإشعارات بنجاح" : "Notifications sent successfully")

            // Reset form
            setTitle("")
            setMessage("")
            setUserIds("")
            setSelectedUsers([])
            setTarget("all_users")
            setAllUsers([])
            setSearchQuery("")
            setSearchResults([])
            setHasSearched(false)

            // Optionally redirect back to admin dashboard
        } catch (error: any) {
            console.error('Error sending notification:', error)
            toast.error(isArabic ? "فشل إرسال الإشعارات" : "Failed to send notifications")
        } finally {
            setIsSending(false)
        }
    }

    // المستخدمين المعروضين (نتائج البحث أو جميع المستخدمين)
    const displayedUsers = searchQuery.trim() && hasSearched ? searchResults : allUsers

    // تصفية المستخدمين المعروضين حسب الدور
    const filteredDisplayedUsers = displayedUsers.filter(user =>
        target === "specific_users" ? user.role === 'user' : user.role === 'seller'
    )

    // تحديد الرسالة المناسبة للعرض
    const getDisplayMessage = () => {
        if (isLoadingUsers) {
            return null; // سيظهر الـ loader
        }

        if (searchQuery.trim() && hasSearched) {
            if (isSearching) {
                return null; // سيظهر الـ loader
            }
            if (filteredDisplayedUsers.length === 0) {
                return isArabic ? "لم يتم العثور على مستخدمين" : "No users found";
            }
        } else {
            if (filteredDisplayedUsers.length === 0 && !isLoadingUsers) {
                return isArabic ? "لا توجد مستخدمين" : "No users available";
            }
        }

        return null;
    }

    const displayMessage = getDisplayMessage();

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    {isArabic ? "إرسال إشعارات" : "Send Notifications"}
                </h1>
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                >
                    {isArabic ? "رجوع" : "Back"}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {isArabic ? "إنشاء إشعار جديد" : "Create New Notification"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="title">
                                {isArabic ? "عنوان الإشعار" : "Notification Title"} *
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                disabled={isSending}
                                placeholder={isArabic ? "أدخل عنوان الإشعار" : "Enter notification title"}
                            />
                        </div>

                        <div>
                            <Label htmlFor="message">
                                {isArabic ? "محتوى الإشعار" : "Notification Message"} *
                            </Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                className="min-h-[120px]"
                                disabled={isSending}
                                placeholder={isArabic ? "أدخل محتوى الإشعار" : "Enter notification message"}
                            />
                        </div>

                        <div>
                            <Label>
                                {isArabic ? "إرسال إلى" : "Send To"} *
                            </Label>
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="all_users"
                                        name="target"
                                        value="all_users"
                                        checked={target === "all_users"}
                                        onChange={() => setTarget("all_users")}
                                        className="h-4 w-4"
                                        disabled={isSending}
                                    />
                                    <label htmlFor="all_users" className="text-sm flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        {isArabic ? "جميع المستخدمين" : "All Users"}
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="specific_users"
                                        name="target"
                                        value="specific_users"
                                        checked={target === "specific_users"}
                                        onChange={() => setTarget("specific_users")}
                                        className="h-4 w-4"
                                        disabled={isSending}
                                    />
                                    <label htmlFor="specific_users" className="text-sm flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {isArabic ? "مستخدمين محددين" : "Specific Users"}
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="all_sellers"
                                        name="target"
                                        value="all_sellers"
                                        checked={target === "all_sellers"}
                                        onChange={() => setTarget("all_sellers")}
                                        className="h-4 w-4"
                                        disabled={isSending}
                                    />
                                    <label htmlFor="all_sellers" className="text-sm flex items-center gap-2">
                                        <Store className="h-4 w-4" />
                                        {isArabic ? "جميع البائعين" : "All Sellers"}
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="specific_sellers"
                                        name="target"
                                        value="specific_sellers"
                                        checked={target === "specific_sellers"}
                                        onChange={() => setTarget("specific_sellers")}
                                        className="h-4 w-4"
                                        disabled={isSending}
                                    />
                                    <label htmlFor="specific_sellers" className="text-sm flex items-center gap-2">
                                        <Store className="h-4 w-4" />
                                        {isArabic ? "بائعين محددين" : "Specific Sellers"}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {(target === "specific_users" || target === "specific_sellers") && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="search">
                                        {isArabic ? "بحث عن المستخدمين" : "Search Users"}
                                    </Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            id="search"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder={
                                                isArabic
                                                    ? target === "specific_users"
                                                        ? "ابحث عن المستخدمين بالاسم أو البريد الإلكتروني"
                                                        : "ابحث عن البائعين بالاسم أو البريد الإلكتروني"
                                                    : target === "specific_users"
                                                        ? "Search users by name or email"
                                                        : "Search sellers by name or email"
                                            }
                                            disabled={isSending}
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleSearch}
                                            disabled={isSearching || !searchQuery.trim()}
                                            size="sm"
                                        >
                                            {isSearching ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Search className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Selected Users */}
                                {selectedUsers.length > 0 && (
                                    <div>
                                        <Label className="flex items-center gap-2">
                                            {isArabic ? "المستخدمون المختارون" : "Selected Users"}
                                            <Badge variant="secondary" className="text-xs">
                                                {selectedUsers.length}
                                            </Badge>
                                        </Label>
                                        <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-lg bg-gray-50">
                                            {selectedUsers.map((user) => (
                                                <Badge
                                                    key={user._id}
                                                    variant="default"
                                                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800"
                                                >
                                                    <span className="max-w-[150px] truncate">
                                                        {user.firstName} {user.lastName}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveUser(user._id)}
                                                        className="ml-1 hover:text-red-500"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Users List */}
                                <div>
                                    <Label className="flex items-center gap-2 mb-2">
                                        {isArabic ?
                                            (target === "specific_users" ? "قائمة المستخدمين" : "قائمة البائعين")
                                            : (target === "specific_users" ? "Users List" : "Sellers List")}
                                        <Badge variant="outline" className="text-xs">
                                            {filteredDisplayedUsers.length} {isArabic ? "نتيجة" : "results"}
                                        </Badge>
                                    </Label>

                                    {(isLoadingUsers || isSearching) ? (
                                        <MirvoryPageLoader text={language === "ar" ? "جاري التحميل..." : "Loading..."} />

                                    ) : displayMessage ? (
                                        <div className="text-center py-8 text-gray-500 border rounded-lg">
                                            {displayMessage}
                                        </div>
                                    ) : filteredDisplayedUsers.length > 0 ? (
                                        <div className="border rounded-lg max-h-60 overflow-y-auto">
                                            {filteredDisplayedUsers.map((user) => (
                                                <div
                                                    key={user._id}
                                                    className={`flex items-center justify-between p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${selectedUsers.find(u => u._id === user._id) ? 'bg-blue-50 border-blue-200' : ''
                                                        }`}
                                                    onClick={() => handleAddUser(user)}
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-medium">
                                                            {user.firstName} {user.lastName}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                        {user.phone && (
                                                            <p className="text-sm text-gray-500">{user.phone}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {user.role}
                                                        </Badge>
                                                        {selectedUsers.find(u => u._id === user._id) && (
                                                            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                                                {isArabic ? "مختار" : "Selected"}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isSending}
                            >
                                {isArabic ? "إلغاء" : "Cancel"}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSending}
                            >
                                {isSending
                                    ? (isArabic ? "جاري الإرسال..." : "Sending...")
                                    : (isArabic ? "إرسال" : "Send")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}