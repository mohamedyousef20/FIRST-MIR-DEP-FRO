import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Edit, Trash2, MapPin, Clock } from "lucide-react";
import { useState } from "react";

interface PickupPoint {
    _id?: string;
    stationName: string;
    location: { type: 'Point'; coordinates: [number, number] };
    address: string;
    phone: string;
    workingHours: string;
    status: string;
}

interface PickupPointsTabProps {
    sellers?: any[];
    pickupPoints: any[];
    loadingPickupPoints: boolean;
    showAddPickupPoint: boolean;
    setShowAddPickupPoint: (show: boolean) => void;
    selectedPickupPoint: any;
    setSelectedPickupPoint: (point: any) => void;
    handleSubmitPickupPoint: (e: React.FormEvent) => void;
    handleDeletePickupPoint: (id: string) => void;
    fetchPickupPoints?: () => Promise<any>;
    isArabic: boolean;
}

export function PickupPointsTab({
    sellers,
    pickupPoints,
    loadingPickupPoints,
    showAddPickupPoint,
    setShowAddPickupPoint,
    handleSubmitPickupPoint,
    handleDeletePickupPoint,
    fetchPickupPoints,
    isArabic
}: PickupPointsTabProps) {
    const [selectedPickupPoint, setSelectedPickupPoint] = useState<PickupPoint | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold">{isArabic ? "إدارة نقاط الاستلام" : "Pickup Points Management"}</h2>
                    <p className="text-muted-foreground">
                        {isArabic
                            ? "إدارة نقاط الاستلام والتحكم في عرضها في المتجر"
                            : "Manage pickup points and control how they appear in your store"}
                    </p>
                </div>
                <Button onClick={() => {
                    setSelectedPickupPoint({
                        stationName: '',
                        location: {
                            type: 'Point',
                            coordinates: [0, 0]
                        },
                        address: '',
                        phone: '',
                        workingHours: '',
                        status: 'active'
                    });
                    setShowAddPickupPoint(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isArabic ? "إضافة نقطة استلام" : "Add Pickup Point"}
                </Button>
            </div>

            {showAddPickupPoint && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {selectedPickupPoint?._id
                                ? (isArabic ? 'تعديل نقطة الاستلام' : 'Edit Pickup Point')
                                : (isArabic ? 'إضافة نقطة استلام جديدة' : 'Add New Pickup Point')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmitPickupPoint} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="stationName">
                                        {isArabic ? 'اسم المحطة' : 'Station Name'} *
                                    </Label>
                                    <Input
                                        id="stationName"
                                        value={selectedPickupPoint?.stationName || ''}
                                        onChange={(e) => setSelectedPickupPoint((prev: PickupPoint | null) => prev ? ({
                                            ...prev,
                                            stationName: e.target.value
                                        }) : null)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">
                                        {isArabic ? 'العنوان' : 'Address'} *
                                    </Label>
                                    <Input
                                        id="address"
                                        value={selectedPickupPoint?.address || ''}
                                        onChange={(e) => setSelectedPickupPoint((prev: PickupPoint | null) => prev ? ({
                                            ...prev,
                                            address: e.target.value
                                        }) : null)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="workingHours">
                                        <Clock className="h-4 w-4 inline mr-2" />
                                        {isArabic ? 'ساعات العمل' : 'Working Hours'}
                                    </Label>
                                    <Input
                                        id="workingHours"
                                        value={selectedPickupPoint?.workingHours || ''}
                                        onChange={(e) => setSelectedPickupPoint((prev: PickupPoint | null) => prev ? ({
                                            ...prev,
                                            workingHours: e.target.value
                                        }) : null)}
                                        placeholder={isArabic ? "9:00 ص - 10:00 م" : "9:00 AM - 10:00 PM"}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">
                                        {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={selectedPickupPoint?.phone || ''}
                                        onChange={(e) => setSelectedPickupPoint((prev: PickupPoint | null) => prev ? ({
                                            ...prev,
                                            phone: e.target.value
                                        }) : null)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="latitude">
                                        {isArabic ? 'خط العرض' : 'Latitude'} *
                                    </Label>
                                    <Input
                                        id="latitude"
                                        type="number"
                                        step="any"
                                        value={selectedPickupPoint?.location?.coordinates[1] || ''}
                                        onChange={(e) => setSelectedPickupPoint((prev: PickupPoint | null) => prev ? ({
                                            ...prev,
                                            location: {
                                                type: 'Point',
                                                coordinates: [
                                                    prev.location?.coordinates[0] || 0,
                                                    parseFloat(e.target.value) || 0
                                                ]
                                            }
                                        }) : null)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="longitude">
                                        {isArabic ? 'خط الطول' : 'Longitude'} *
                                    </Label>
                                    <Input
                                        id="longitude"
                                        type="number"
                                        step="any"
                                        value={selectedPickupPoint?.location?.coordinates[0] || ''}
                                        onChange={(e) => setSelectedPickupPoint((prev: PickupPoint | null) => prev ? ({
                                            ...prev,
                                            location: {
                                                type: 'Point',
                                                coordinates: [
                                                    parseFloat(e.target.value) || 0,
                                                    prev.location?.coordinates[1] || 0
                                                ]
                                            }
                                        }) : null)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">
                                        {isArabic ? 'الحالة' : 'Status'}
                                    </Label>
                                    <Select
                                        value={selectedPickupPoint?.status || 'active'}
                                        onValueChange={(value) => setSelectedPickupPoint((prev: PickupPoint | null) => prev ? ({
                                            ...prev,
                                            status: value
                                        }) : null)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">
                                                {isArabic ? 'نشط' : 'Active'}
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                {isArabic ? 'غير نشط' : 'Inactive'}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowAddPickupPoint(false);
                                        setSelectedPickupPoint(null);
                                    }}
                                >
                                    {isArabic ? 'إلغاء' : 'Cancel'}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!selectedPickupPoint?.stationName || !selectedPickupPoint?.address}
                                >
                                    {selectedPickupPoint?._id
                                        ? (isArabic ? 'تحديث' : 'Update')
                                        : (isArabic ? 'إنشاء' : 'Create')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loadingPickupPoints ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : pickupPoints.length === 0 ? (
                <div className="text-center py-12">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-gray-500" />
                    </div>
                    <h2 className="text-xl font-medium mb-2">
                        {isArabic ? "لا توجد نقاط استلام" : "No Pickup Points Found"}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {isArabic
                            ? "لم يتم العثور على أي نقاط استلام. ابدأ بإضافة نقطة استلام جديدة."
                            : "No pickup points found. Start by adding a new pickup point."}
                    </p>
                    <Button onClick={() => setShowAddPickupPoint(true)}>
                        {isArabic ? "إضافة نقطة استلام" : "Add Pickup Point"}
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pickupPoints.map((point) => (
                            <Card key={point._id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                                {point.stationName}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                <Clock className="h-4 w-4 inline mr-1" />
                                                {point.workingHours}
                                            </p>
                                        </div>
                                        <Badge variant={point.status === 'active' ? 'default' : 'secondary'}>
                                            {point.status === 'active'
                                                ? (isArabic ? 'نشط' : 'Active')
                                                : (isArabic ? 'غير نشط' : 'Inactive')}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <p className="font-medium">{point.address}</p>
                                        {point.phone && (
                                            <p className="text-muted-foreground">{point.phone}</p>
                                        )}
                                        {point.location?.coordinates && (
                                            <p className="text-xs text-muted-foreground">
                                                Coordinates: {point.location.coordinates[0]}, {point.location.coordinates[1]}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex justify-end mt-4 space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedPickupPoint(point);
                                                setShowAddPickupPoint(true);
                                            }}
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            {isArabic ? 'تعديل' : 'Edit'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive"
                                            onClick={() => handleDeletePickupPoint(point._id!)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            {isArabic ? 'حذف' : 'Delete'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">
                            {isArabic ? "جميع نقاط الاستلام" : "All Pickup Points"}
                        </h3>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{isArabic ? "اسم المحطة" : "Station Name"}</TableHead>
                                        <TableHead>{isArabic ? "العنوان" : "Address"}</TableHead>
                                        <TableHead>{isArabic ? "الهاتف" : "Phone"}</TableHead>
                                        <TableHead>{isArabic ? "ساعات العمل" : "Working Hours"}</TableHead>
                                        <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                                        <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pickupPoints.map((point) => (
                                        <TableRow key={point._id}>
                                            <TableCell className="font-medium">{point.stationName}</TableCell>
                                            <TableCell>{point.address}</TableCell>
                                            <TableCell>{point.phone || '-'}</TableCell>
                                            <TableCell>{point.workingHours || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={point.status === 'active' ? 'default' : 'secondary'}>
                                                    {point.status === 'active'
                                                        ? (isArabic ? 'نشط' : 'Active')
                                                        : (isArabic ? 'غير نشط' : 'Inactive')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedPickupPoint(point);
                                                            setShowAddPickupPoint(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        {isArabic ? "تعديل" : "Edit"}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive"
                                                        onClick={() => handleDeletePickupPoint(point._id!)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        {isArabic ? "حذف" : "Delete"}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}