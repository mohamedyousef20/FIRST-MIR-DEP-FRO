import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Edit, Trash, Upload, Calendar, Star, Link, ExternalLink } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

interface AnnouncementsTabProps {
    announcements: any[];
    loadingAnnouncements: boolean;
    errorAnnouncements: string | null;
    showAddAnnouncement: boolean;
    setShowAddAnnouncement: (show: boolean) => void;
    selectedAnnouncement: any;
    setSelectedAnnouncement: (announcement: any) => void;
    newAnnouncement: any;
    setNewAnnouncement: (announcement: any) => void;
    announcementImage: File | null;
    handleSaveAnnouncement: () => void;
    handleDeleteAnnouncement: (id: string) => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveImage: () => void;
    imageUrl: string;
    fetchAnnouncements?: () => Promise<any>;
    setImageUrl: (url: string) => void;
    isArabic: boolean;
}

export function AnnouncementsTab({
    announcements,
    loadingAnnouncements,
    errorAnnouncements,
    showAddAnnouncement,
    setShowAddAnnouncement,
    selectedAnnouncement,
    setSelectedAnnouncement,
    newAnnouncement,
    setNewAnnouncement,
    announcementImage,
    handleSaveAnnouncement,
    handleDeleteAnnouncement,
    handleImageUpload,
    handleRemoveImage,
    imageUrl,
    fetchAnnouncements,
    setImageUrl,
    isArabic
}: AnnouncementsTabProps) {
    // Handler for when ImageUploader uploads an image
    const handleImageUploaded = (url: string) => {
        //console.log("Image uploaded successfully:", url);
        setImageUrl(url);

        // Update either selected announcement or new announcement with the image URL
        if (selectedAnnouncement) {
            setSelectedAnnouncement({
                ...selectedAnnouncement,
                image: url
            });
        } else {
            setNewAnnouncement({
                ...newAnnouncement,
                image: url
            });
        }
    };

    // Reset image when editing or creating new
    const handleEditOrCreate = (announcement: any | null) => {
        if (announcement) {
            setSelectedAnnouncement(announcement);
            setImageUrl(announcement.image || "");
        } else {
            // Initialize with empty values including link field
            setNewAnnouncement({
                title: "",
                content: "",
                startDate: "",
                endDate: "",
                status: "active",
                isMain: false,
                image: "",
                link: ""
            });
            setImageUrl("");
        }
        setShowAddAnnouncement(true);
    };

    // Enhanced save handler
    const handleSave = () => {
        // Ensure image URL is included
        const announcementToSave = selectedAnnouncement
            ? {
                ...selectedAnnouncement,
                image: selectedAnnouncement.image || imageUrl,
                link: selectedAnnouncement.link || ""
            }
            : {
                ...newAnnouncement,
                image: newAnnouncement.image || imageUrl,
                link: newAnnouncement.link || ""
            };

        // Update the state
        if (selectedAnnouncement) {
            setSelectedAnnouncement(announcementToSave);
        } else {
            setNewAnnouncement(announcementToSave);
        }

        // Call the original save handler
        handleSaveAnnouncement();
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Check if announcement is currently active
    const isCurrentlyActive = (announcement: any) => {
        const now = new Date();
        const start = new Date(announcement.startDate);
        const end = new Date(announcement.endDate);
        return announcement.status === 'active' && now >= start && now <= end;
    };

    // Check if announcement is upcoming
    const isUpcoming = (announcement: any) => {
        const now = new Date();
        const start = new Date(announcement.startDate);
        return announcement.status === 'active' && now < start;
    };

    // Check if announcement is expired
    const isExpired = (announcement: any) => {
        const now = new Date();
        const end = new Date(announcement.endDate);
        return now > end;
    };

    // Get announcement status badge
    const getAnnouncementStatus = (announcement: any) => {
        if (announcement.status === 'inactive') {
            return {
                label: isArabic ? 'غير نشط' : 'Inactive',
                variant: 'secondary' as const,
                color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            };
        }

        if (isExpired(announcement)) {
            return {
                label: isArabic ? 'منتهي' : 'Expired',
                variant: 'destructive' as const,
                color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            };
        }

        if (isCurrentlyActive(announcement)) {
            return {
                label: isArabic ? 'نشط الآن' : 'Active Now',
                variant: 'default' as const,
                color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            };
        }

        if (isUpcoming(announcement)) {
            return {
                label: isArabic ? 'قادم' : 'Upcoming',
                variant: 'outline' as const,
                color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300'
            };
        }

        return {
            label: announcement.status || 'N/A',
            variant: 'secondary' as const,
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        };
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold">{isArabic ? "إدارة الإعلانات" : "Announcements Management"}</h2>
                    <p className="text-muted-foreground">
                        {isArabic
                            ? "إدارة الإعلانات والتحكم في عرضها في المتجر"
                            : "Manage announcements and control how they appear in your store"}
                    </p>
                </div>
                <Button onClick={() => handleEditOrCreate(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isArabic ? "إضافة إعلان" : "Add Announcement"}
                </Button>
            </div>

            {showAddAnnouncement && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>
                            {selectedAnnouncement?._id
                                ? isArabic ? "تعديل الإعلان" : "Edit Announcement"
                                : isArabic ? "إضافة إعلان جديد" : "Add New Announcement"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Image Uploader for announcements */}
                            <div>
                                <Label className="mb-2 block">
                                    {isArabic ? "صورة الإعلان" : "Announcement Image"}
                                </Label>
                                <ImageUploader
                                    onUpload={handleImageUploaded}
                                    className="mb-4"
                                    maxSizeMb={10}
                                />

                                {/* Show current image if exists */}
                                {(selectedAnnouncement?.image || newAnnouncement.image || imageUrl) && (
                                    <div className="mt-4">
                                        <Label className="mb-2 block">
                                            {isArabic ? "الصورة الحالية" : "Current Image"}
                                        </Label>
                                        <div className="relative">
                                            <img
                                                src={selectedAnnouncement?.image || newAnnouncement.image || imageUrl}
                                                alt={isArabic ? "صورة الإعلان" : "Announcement image"}
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={() => {
                                                    if (selectedAnnouncement) {
                                                        setSelectedAnnouncement({
                                                            ...selectedAnnouncement,
                                                            image: ""
                                                        });
                                                    } else {
                                                        setNewAnnouncement({
                                                            ...newAnnouncement,
                                                            image: ""
                                                        });
                                                    }
                                                    setImageUrl("");
                                                }}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Title Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="title">{isArabic ? "العنوان (عربي)" : "Title (Arabic)"} *</Label>
                                    <Input
                                        id="title"
                                        value={selectedAnnouncement?.title || newAnnouncement.title || ""}
                                        onChange={(e) =>
                                            selectedAnnouncement
                                                ? setSelectedAnnouncement({ ...selectedAnnouncement, title: e.target.value })
                                                : setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                {/* <div>
                                    <Label htmlFor="titleEn">{isArabic ? "العنوان (إنجليزي)" : "Title (English)"} *</Label>
                                    <Input
                                        id="titleEn"
                                        value={selectedAnnouncement?.titleEn || newAnnouncement.titleEn || ""}
                                        onChange={(e) =>
                                            selectedAnnouncement
                                                ? setSelectedAnnouncement({ ...selectedAnnouncement, titleEn: e.target.value })
                                                : setNewAnnouncement({ ...newAnnouncement, titleEn: e.target.value })
                                        }
                                        required
                                    />
                                </div> */}
                            </div>

                            {/* Content Fields */}
                            <div>
                                <Label htmlFor="content">{isArabic ? "المحتوى (عربي)" : "Content (Arabic)"} *</Label>
                                <Textarea
                                    id="content"
                                    value={selectedAnnouncement?.content || newAnnouncement.content || ""}
                                    onChange={(e) =>
                                        selectedAnnouncement
                                            ? setSelectedAnnouncement({ ...selectedAnnouncement, content: e.target.value })
                                            : setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
                                    }
                                    rows={3}
                                    required
                                />
                            </div>
                            {/* <div>
                                <Label htmlFor="contentEn">{isArabic ? "المحتوى (إنجليزي)" : "Content (English)"} *</Label>
                                <Textarea
                                    id="contentEn"
                                    value={selectedAnnouncement?.contentEn || newAnnouncement.contentEn || ""}
                                    onChange={(e) =>
                                        selectedAnnouncement
                                            ? setSelectedAnnouncement({ ...selectedAnnouncement, contentEn: e.target.value })
                                            : setNewAnnouncement({ ...newAnnouncement, contentEn: e.target.value })
                                    }
                                    rows={3}
                                    required
                                />
                            </div> */}

                            {/* Link Field */}
                            <div>
                                <Label htmlFor="link">
                                    <Link className="h-4 w-4 inline mr-2" />
                                    {isArabic ? "رابط خارجي (اختياري)" : "External Link (Optional)"}
                                </Label>
                                <Input
                                    id="link"
                                    type="url"
                                    value={selectedAnnouncement?.link || newAnnouncement.link || ""}
                                    onChange={(e) =>
                                        selectedAnnouncement
                                            ? setSelectedAnnouncement({ ...selectedAnnouncement, link: e.target.value })
                                            : setNewAnnouncement({ ...newAnnouncement, link: e.target.value })
                                    }
                                    placeholder="https://example.com"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    {isArabic
                                        ? "عند النقر على الإعلان، سيتم توجيه المستخدم إلى هذا الرابط"
                                        : "When users click the announcement, they will be redirected to this link"
                                    }
                                </p>
                            </div>

                            {/* Date Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startDate">
                                        <Calendar className="h-4 w-4 inline mr-2" />
                                        {isArabic ? "تاريخ البدء" : "Start Date"} *
                                    </Label>
                                    <Input
                                        id="startDate"
                                        type="datetime-local"
                                        value={selectedAnnouncement?.startDate
                                            ? new Date(selectedAnnouncement.startDate).toISOString().slice(0, 16)
                                            : newAnnouncement.startDate || ""
                                        }
                                        onChange={(e) =>
                                            selectedAnnouncement
                                                ? setSelectedAnnouncement({ ...selectedAnnouncement, startDate: e.target.value })
                                                : setNewAnnouncement({ ...newAnnouncement, startDate: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="endDate">
                                        <Calendar className="h-4 w-4 inline mr-2" />
                                        {isArabic ? "تاريخ الانتهاء" : "End Date"} *
                                    </Label>
                                    <Input
                                        id="endDate"
                                        type="datetime-local"
                                        value={selectedAnnouncement?.endDate
                                            ? new Date(selectedAnnouncement.endDate).toISOString().slice(0, 16)
                                            : newAnnouncement.endDate || ""
                                        }
                                        onChange={(e) =>
                                            selectedAnnouncement
                                                ? setSelectedAnnouncement({ ...selectedAnnouncement, endDate: e.target.value })
                                                : setNewAnnouncement({ ...newAnnouncement, endDate: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            {/* Status and Main Announcement Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="status">{isArabic ? "الحالة" : "Status"} *</Label>
                                    <Select
                                        value={selectedAnnouncement?.status || newAnnouncement.status || "active"}
                                        onValueChange={(value) =>
                                            selectedAnnouncement
                                                ? setSelectedAnnouncement({ ...selectedAnnouncement, status: value })
                                                : setNewAnnouncement({ ...newAnnouncement, status: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">{isArabic ? "نشط" : "Active"}</SelectItem>
                                            <SelectItem value="inactive">{isArabic ? "غير نشط" : "Inactive"}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <Star className={`h-5 w-5 ${(selectedAnnouncement?.isMain ?? newAnnouncement.isMain) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                                        <div className="flex flex-col space-y-1">
                                            <Label htmlFor="isMain-toggle" className="text-sm font-medium">
                                                {isArabic ? "الإعلان الرئيسي" : "Main Announcement"}
                                            </Label>
                                            <p className="text-sm text-gray-500">
                                                {isArabic
                                                    ? "يظهر بشكل بارز في الصفحة الرئيسية"
                                                    : "Prominently displayed on homepage"
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <Switch
                                        id="isMain-toggle"
                                        checked={selectedAnnouncement?.isMain ?? newAnnouncement.isMain ?? false}
                                        onCheckedChange={(checked) => {
                                            if (selectedAnnouncement) {
                                                setSelectedAnnouncement({
                                                    ...selectedAnnouncement,
                                                    isMain: checked
                                                });
                                            } else {
                                                setNewAnnouncement({
                                                    ...newAnnouncement,
                                                    isMain: checked
                                                });
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6 space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowAddAnnouncement(false);
                                    setSelectedAnnouncement(null);
                                    setImageUrl("");
                                }}
                            >
                                {isArabic ? "إلغاء" : "Cancel"}
                            </Button>
                            <Button onClick={handleSave}>
                                {selectedAnnouncement?._id
                                    ? (isArabic ? "تحديث" : "Update")
                                    : (isArabic ? "إنشاء" : "Create")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Rest of the component remains the same... */}
            {loadingAnnouncements ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : errorAnnouncements ? (
                <div className="text-center py-12">
                    <div className="text-destructive mb-4">{errorAnnouncements}</div>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        {isArabic ? "إعادة المحاولة" : "Try Again"}
                    </Button>
                </div>
            ) : announcements.length === 0 ? (
                <div className="text-center py-12">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-gray-500" />
                    </div>
                    <h2 className="text-xl font-medium mb-2">
                        {isArabic ? "لا توجد إعلانات" : "No Announcements Found"}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {isArabic
                            ? "لم يتم العثور على أي إعلانات. ابدأ بإضافة إعلان جديد."
                            : "No announcements found. Start by adding a new announcement."}
                    </p>
                    <Button onClick={() => handleEditOrCreate(null)}>
                        {isArabic ? "إضافة إعلان" : "Add Announcement"}
                    </Button>
                </div>
            ) : (
                <>
                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {isArabic ? "إجمالي الإعلانات" : "Total Announcements"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{announcements.length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {isArabic ? "نشطة الآن" : "Active Now"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {announcements.filter(isCurrentlyActive).length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {isArabic ? "الإعلانات الرئيسية" : "Main Announcements"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {announcements.filter(a => a.isMain).length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {isArabic ? "تمتلك روابط" : "With Links"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">
                                    {announcements.filter(a => a.link).length}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Announcements Grid View */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {announcements.map((announcement: any) => {
                            const statusInfo = getAnnouncementStatus(announcement);
                            return (
                                <Card key={announcement._id} className="hover:shadow-md transition-shadow overflow-hidden">
                                    {announcement.image && (
                                        <div className="relative h-48 overflow-hidden">
                                            <img
                                                src={announcement.image}
                                                alt={isArabic ? announcement.title : announcement.titleEn}
                                                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                            />
                                            {announcement.isMain && (
                                                <div className="absolute top-2 right-2">
                                                    <Badge className="bg-yellow-500 hover:bg-yellow-600">
                                                        <Star className="h-3 w-3 mr-1" />
                                                        {isArabic ? "رئيسي" : "Main"}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <CardHeader className={!announcement.image ? "pb-2" : ""}>
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg">
                                                {isArabic ? announcement.title : announcement.titleEn}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant={statusInfo.variant} className={statusInfo.color}>
                                                {statusInfo.label}
                                            </Badge>
                                            {announcement.link && (
                                                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                                    <Link className="h-3 w-3 mr-1" />
                                                    {isArabic ? "رابط" : "Link"}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {isArabic ? announcement.content : announcement.contentEn}
                                        </p>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <div className="flex justify-between">
                                                <span>{isArabic ? "بداية:" : "Start:"}</span>
                                                <span>{formatDate(announcement.startDate)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>{isArabic ? "نهاية:" : "End:"}</span>
                                                <span>{formatDate(announcement.endDate)}</span>
                                            </div>
                                        </div>
                                        {announcement.link && (
                                            <div className="text-xs">
                                                <a
                                                    href={announcement.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                    {isArabic ? "عرض الرابط" : "View Link"}
                                                </a>
                                            </div>
                                        )}
                                        <div className="flex justify-end space-x-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditOrCreate(announcement)}
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                {isArabic ? "تعديل" : "Edit"}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDeleteAnnouncement(announcement._id)}
                                            >
                                                <Trash className="h-4 w-4 mr-1" />
                                                {isArabic ? "حذف" : "Delete"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Detailed Table View */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">{isArabic ? "جميع الإعلانات" : "All Announcements"}</h3>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">{isArabic ? "المعرف" : "ID"}</TableHead>
                                        <TableHead>{isArabic ? "العنوان" : "Title"}</TableHead>
                                        <TableHead>{isArabic ? "الصورة" : "Image"}</TableHead>
                                        <TableHead>{isArabic ? "الرابط" : "Link"}</TableHead>
                                        <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                                        <TableHead>{isArabic ? "تاريخ البدء" : "Start Date"}</TableHead>
                                        <TableHead>{isArabic ? "تاريخ الانتهاء" : "End Date"}</TableHead>
                                        <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {announcements.map((announcement: any) => {
                                        const statusInfo = getAnnouncementStatus(announcement);
                                        return (
                                            <TableRow key={announcement._id}>
                                                <TableCell className="font-medium">
                                                    <div className="text-xs text-muted-foreground">
                                                        #{announcement._id.substring(0, 8)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <div className="font-medium">
                                                            {isArabic ? announcement.title : announcement.titleEn}
                                                        </div>
                                                        {announcement.isMain && (
                                                            <span className="text-xs text-blue-600 flex items-center gap-1">
                                                                <Star className="h-3 w-3" />
                                                                {isArabic ? "رئيسي" : "Main"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {announcement.image ? (
                                                        <img
                                                            src={announcement.image}
                                                            alt={isArabic ? announcement.title : announcement.titleEn}
                                                            className="w-16 h-12 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            {isArabic ? "بدون صورة" : "No Image"}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {announcement.link ? (
                                                        <a
                                                            href={announcement.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                                        >
                                                            <Link className="h-3 w-3" />
                                                            {isArabic ? "رابط" : "Link"}
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            {isArabic ? "بدون رابط" : "No Link"}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={statusInfo.variant} className={statusInfo.color}>
                                                        {statusInfo.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(announcement.startDate)}</TableCell>
                                                <TableCell>{formatDate(announcement.endDate)}</TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditOrCreate(announcement)}
                                                        >
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            {isArabic ? "تعديل" : "Edit"}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => handleDeleteAnnouncement(announcement._id)}
                                                        >
                                                            <Trash className="h-4 w-4 mr-1" />
                                                            {isArabic ? "حذف" : "Delete"}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}