'use client'
import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Plus, X, Palette, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import ImageUploader from '@/components/ImageUploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { categoryService, productService } from '@/lib/api';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ChromePicker } from 'react-color';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthProvider';

interface AddProductFormProps {
  onClose: () => void;
}

interface Color {
  name: string;
  value: string;
  available: boolean;
}

export default function AddProductForm({ onClose }: AddProductFormProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState({
    name: '',
    value: '#000000',
    available: true
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    discountPercentage: '0',
    discountedPrice: '',
    category: '',
    images: [] as string[],
    brand: "",
    sizes: [] as string[],
    colors: [] as Color[],
    quantity: '0',
    isFeatured: false,
    status: 'available' as 'available' | 'pending',
    // Removed fixed sellerPercentage from state since it's calculated dynamically
  });
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    image: '',
    status: 'active' as 'active' | 'inactive'
  });

  // Helper function to get platform fee based on price
  function getPlatformFeeByPrice(price: number): number {
    if (!price || price <= 0) return 0.10; // Default

    if (price < 300) return 0.18;
    if (price >= 300 && price <= 799) return 0.15;
    if (price >= 800 && price <= 1999) return 0.12;
    return 0.10; // more than 2000
  }

  // Helper function to explain the price range
  function getPriceRangeExplanation(price: number, language = 'ar'): string {
    if (!price) return '';

    if (price < 300) {
      return language === 'ar'
        ? 'أقل من 300: رسوم المنصة 18%، نسبة البائع 82%'
        : 'Below 300: Platform fee 18%, Seller gets 82%';
    }
    if (price >= 300 && price <= 799) {
      return language === 'ar'
        ? '300-799: رسوم المنصة 15%، نسبة البائع 85%'
        : '300-799: Platform fee 15%, Seller gets 85%';
    }
    if (price >= 800 && price <= 1999) {
      return language === 'ar'
        ? '800-1999: رسوم المنصة 12%، نسبة البائع 88%'
        : '800-1999: Platform fee 12%, Seller gets 88%';
    }
    return language === 'ar'
      ? 'أكثر من 2000: رسوم المنصة 10%، نسبة البائع 90%'
      : 'Above 2000: Platform fee 10%, Seller gets 90%';
  }

  // Calculate dynamic values based on discounted price
  const discountedPrice = parseFloat(newProduct.discountedPrice) || 0;
  const platformFee = getPlatformFeeByPrice(discountedPrice);
  const sellerPercentage = 1 - platformFee;
  const sellerAmount = discountedPrice > 0
    ? (discountedPrice * sellerPercentage).toFixed(2)
    : '0.00';

  // Fetch categories & brands on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data);
      } catch (error) {
        toast.error(language === 'ar' ? 'فشل جلب الفئات' : 'Failed to fetch categories');
      }
    };
    const fetchBrands = async () => {
      try {
        const res = await (await import('@/lib/api')).brandService.getBrands();
        setBrands(res.data);
      } catch (err) {
        toast.error(language === 'ar' ? 'فشل جلب الماركات' : 'Failed to fetch brands');
      }
    };
    fetchCategories();
    fetchBrands();
  }, [language]);

  // Calculate discounted price when price or discount percentage changes
  useEffect(() => {
    const price = parseFloat(newProduct.price) || 0;
    const discountPercentage = parseFloat(newProduct.discountPercentage) || 0;

    if (price > 0 && discountPercentage >= 0 && discountPercentage <= 100) {
      const discountAmount = price * (discountPercentage / 100);
      const discountedPrice = price - discountAmount;
      setNewProduct(prev => ({
        ...prev,
        discountedPrice: discountedPrice.toFixed(2)
      }));
    } else if (price > 0) {
      setNewProduct(prev => ({
        ...prev,
        discountedPrice: price.toFixed(2)
      }));
    }
  }, [newProduct.price, newProduct.discountPercentage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow only numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setNewProduct(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setNewProduct(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (url: string) => {
    setNewProduct(prev => ({
      ...prev,
      images: [...prev.images, url],
    }));
    toast.success(language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
  };

  const removeImage = (index: number) => {
    setNewProduct(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  // const handleCreateCategory = async () => {
  //   try {
  //     if (!newCategory.name || !newCategory.nameEn) {
  //       toast.error(language === 'ar' ? 'الرجاء إدخال اسم الفئة بالعربية والإنجليزية' : 'Please enter category name in Arabic and English');
  //       return;
  //     }

  // const response = await categoryService.createCategory(newCategory);
  // toast.success(language === 'ar' ? 'تم إنشاء الفئة بنجاح' : 'Category created successfully');

  // // Refresh categories list
  // const categoriesResponse = await categoryService.getCategories();
  // setCategories(categoriesResponse.data);

  // // Set the newly created category as selected
  // setNewProduct(prev => ({ ...prev, category: response.data._id }));

  // Reset form and close dialog
  //     setNewCategory({
  //       name: '',
  //       nameEn: '',
  //       description: '',
  //       descriptionEn: '',
  //       image: '',
  //       status: 'active'
  //     });
  //     setShowCategoryDialog(false);
  //   } catch (error: any) {
  //     toast.error(
  //       error.response?.data?.message ||
  //       (language === 'ar' ? 'فشل إنشاء الفئة' : 'Failed to create category')
  //     );
  //   }
  // };

  const addSize = () => {
    if (sizeInput.trim() && !newProduct.sizes.includes(sizeInput.trim())) {
      setNewProduct(prev => ({
        ...prev,
        sizes: [...prev.sizes, sizeInput.trim()],
      }));
      setSizeInput('');
    }
  };

  const removeSize = (size: string) => {
    setNewProduct(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size),
    }));
  };

  const handleColorChange = (color: any) => {
    setColorInput(prev => ({
      ...prev,
      value: color.hex
    }));
  };

  const addColor = () => {
    if (colorInput.name.trim() && colorInput.value) {
      // Check if color with same value already exists
      const colorExists = newProduct.colors.some(color =>
        color.value.toLowerCase() === colorInput.value.toLowerCase()
      );

      if (colorExists) {
        toast.error(language === 'ar' ? 'هذا اللون مضاف مسبقاً' : 'This color already exists');
        return;
      }

      const newColor: Color = {
        name: colorInput.name.trim(),
        value: colorInput.value,
        available: colorInput.available
      };

      setNewProduct(prev => ({
        ...prev,
        colors: [...prev.colors, newColor],
      }));

      // Reset color input
      setColorInput({
        name: '',
        value: '#000000',
        available: true
      });
      setShowColorPicker(false);
    } else {
      toast.error(language === 'ar' ? 'الرجاء إدخال اسم اللون' : 'Please enter color name');
    }
  };

  const removeColor = (colorValue: string) => {
    setNewProduct(prev => ({
      ...prev,
      colors: prev.colors.filter(color => color.value !== colorValue),
    }));
  };

  const toggleColorAvailability = (colorValue: string) => {
    setNewProduct(prev => ({
      ...prev,
      colors: prev.colors.map(color =>
        color.value === colorValue
          ? { ...color, available: !color.available }
          : color
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please log in first');
      return;
    }

    // Validate required fields
    if (newProduct.images.length === 0) {
      toast.error(language === 'ar' ? 'الرجاء إضافة صورة واحدة على الأقل' : 'Please add at least one image');
      return;
    }

    if (!newProduct.category) {
      toast.error(language === 'ar' ? 'الرجاء اختيار فئة' : 'Please select a category');
      return;
    }
    if (!newProduct.brand) {
      toast.error(language === 'ar' ? 'الرجاء اختيار ماركة' : 'Please select a brand');
      return;
    }

    setLoading(true);

    try {
      // Calculate dynamic seller percentage
      const price = parseFloat(newProduct.discountedPrice) || parseFloat(newProduct.price) || 0;
      const platformFee = getPlatformFeeByPrice(price);
      const calculatedSellerPercentage = (1 - platformFee) * 100;

      // Prepare product data according to the model
      const productData = {
        title: newProduct.title,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        discountPercentage: parseFloat(newProduct.discountPercentage),
        discountedPrice: parseFloat(newProduct.discountedPrice) || parseFloat(newProduct.price),
        category: newProduct.category,
        brand: newProduct.brand,
        images: newProduct.images,
        sizes: newProduct.sizes,
        colors: newProduct.colors,
        quantity: parseInt(newProduct.quantity) || 0,
        isFeatured: newProduct.isFeatured,
        status: newProduct.status,
        sellerPercentage: calculatedSellerPercentage // Dynamic percentage based on price
      };

      // Create product
      const response = await productService.createProduct(productData);
      //console.log('Product created:', response);
      toast.success(language === 'ar' ? 'تم إنشاء المنتج بنجاح وتم إرسال طلب الاعتماد ' : 'Product added successfully');
      //onClose();
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(
        error.response?.data?.message ||
        (language === 'ar' ? 'حدث خطأ أثناء إضافة المنتج' : 'Error adding product')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          {language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">
              {language === 'ar' ? 'عنوان المنتج' : 'Product Title'} *
            </Label>
            <Input
              id="title"
              name="title"
              value={newProduct.title}
              onChange={handleInputChange}
              placeholder={language === 'ar' ? 'أدخل عنوان المنتج' : 'Enter product title'}
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">
              {language === 'ar' ? 'وصف المنتج' : 'Product Description'} *
            </Label>
            <Textarea
              id="description"
              name="description"
              value={newProduct.description}
              onChange={handleInputChange}
              placeholder={language === 'ar' ? 'أدخل وصف المنتج' : 'Enter product description'}
              required
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price */}
            <div>
              <Label htmlFor="price">{language === 'ar' ? 'السعر' : 'Price'} *</Label>
              <Input
                id="price"
                name="price"
                type="text"
                value={newProduct.price}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                required
              />
            </div>

            {/* Discount Percentage */}
            <div>
              <Label htmlFor="discountPercentage">
                {language === 'ar' ? 'نسبة الخصم %' : 'Discount Percentage %'}
              </Label>
              <Input
                id="discountPercentage"
                name="discountPercentage"
                type="text"
                value={newProduct.discountPercentage}
                onChange={handleNumberInputChange}
                placeholder="0"
                min="0"
                max="100"
              />
            </div>

            {/* Discounted Price (Auto-calculated) */}
            <div>
              <Label htmlFor="discountedPrice">
                {language === 'ar' ? 'السعر بعد الخصم' : 'Discounted Price'}
              </Label>
              <Input
                id="discountedPrice"
                name="discountedPrice"
                type="text"
                value={newProduct.discountedPrice}
                readOnly
                className="bg-gray-100"
              />
            </div>
          </div>

          {/* Seller Information Section */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">
                {language === 'ar' ? 'معلومات البائع' : 'Seller Information'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Platform Fee Percentage (Dynamic) */}
              <div>
                <Label htmlFor="platformFee">
                  {language === 'ar' ? 'رسوم المنصة %' : 'Platform Fee %'}
                </Label>
                <Input
                  id="platformFee"
                  name="platformFee"
                  type="text"
                  value={`${(platformFee * 100).toFixed(1)}%`}
                  disabled
                  className="bg-gray-200 font-bold"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'ar'
                    ? 'تختلف حسب السعر بعد الخصم'
                    : 'Varies based on discounted price'}
                </p>
              </div>

              {/* Seller Percentage (Dynamic) */}
              <div>
                <Label htmlFor="sellerPercentage">
                  {language === 'ar' ? 'نسبة البائع %' : 'Seller Percentage %'}
                </Label>
                <Input
                  id="sellerPercentage"
                  name="sellerPercentage"
                  type="text"
                  value={`${(sellerPercentage * 100).toFixed(1)}%`}
                  disabled
                  className="bg-gray-200 font-bold"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'ar'
                    ? 'نسبة متغيرة حسب السعر'
                    : 'Variable percentage based on price'}
                </p>
              </div>

              {/* Seller Amount (Auto-calculated) */}
              <div>
                <Label htmlFor="sellerAmount">
                  {language === 'ar' ? 'مبلغ البائع' : 'Seller Amount'}
                </Label>
                <Input
                  id="sellerAmount"
                  name="sellerAmount"
                  type="text"
                  value={sellerAmount}
                  readOnly
                  className="bg-green-100 font-bold text-green-800"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'ar'
                    ? `السعر بعد الخصم × ${(sellerPercentage * 100).toFixed(1)}%`
                    : `Discounted price × ${(sellerPercentage * 100).toFixed(1)}%`}
                </p>
              </div>
            </div>

            {/* Calculation Explanation */}
            <div className="mt-3 p-3 bg-white rounded border">
              <p className="text-sm text-gray-600">
                {language === 'ar' ? (
                  <>
                    <strong>كيفية الحساب:</strong><br />
                    {getPriceRangeExplanation(discountedPrice, language)}<br />
                    {discountedPrice > 0 && (
                      <>
                        <strong>الحساب:</strong> {discountedPrice} × {(sellerPercentage * 100).toFixed(1)}% = <strong>{sellerAmount}</strong>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <strong>Calculation:</strong><br />
                    {getPriceRangeExplanation(discountedPrice, 'en')}<br />
                    {discountedPrice > 0 && (
                      <>
                        <strong>Formula:</strong> {discountedPrice} × {(sellerPercentage * 100).toFixed(1)}% = <strong>{sellerAmount}</strong>
                      </>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>{language === 'ar' ? 'الماركة' : 'Brand'}</Label>
              <Select
                value={newProduct.brand}
                onValueChange={(v) => handleSelectChange('brand', v)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر الماركة' : 'Select brand'} />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b: any) => (
                    <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">{language === 'ar' ? 'الكمية' : 'Quantity'}</Label>
              <Input
                id="quantity"
                name="quantity"
                type="text"
                value={newProduct.quantity}
                onChange={handleNumberInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            {/* Empty space to balance layout */}
            <div></div>
          </div>

          {/* Sizes */}
          <div>
            <Label htmlFor="sizes">{language === 'ar' ? 'المقاسات' : 'Sizes'}</Label>
            <div className="flex gap-2">
              <Input
                id="sizes"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل مقاساً' : 'Enter a size'}
              />
              <Button
                type="button"
                onClick={addSize}
                variant="secondary"
              >
                {language === 'ar' ? 'إضافة' : 'Add'}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {newProduct.sizes.map((size, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                >
                  <span>{size}</span>
                  <button
                    type="button"
                    onClick={() => removeSize(size)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <Label htmlFor="colors">{language === 'ar' ? 'الألوان' : 'Colors'}</Label>
            <div className="space-y-4">
              {/* Color Input Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <div>
                  <Label htmlFor="colorName">
                    {language === 'ar' ? 'اسم اللون' : 'Color Name'} *
                  </Label>
                  <Input
                    id="colorName"
                    value={colorInput.name}
                    onChange={(e) => setColorInput(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={language === 'ar' ? 'أدخل اسم اللون' : 'Enter color name'}
                  />
                </div>

                <div>
                  <Label htmlFor="colorValue">
                    {language === 'ar' ? 'قيمة اللون' : 'Color Value'} *
                  </Label>
                  <div className="flex gap-2">
                    <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <div
                            className="w-4 h-4 rounded mr-2 border"
                            style={{ backgroundColor: colorInput.value }}
                          />
                          {colorInput.value}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <ChromePicker
                          color={colorInput.value}
                          onChange={handleColorChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={addColor}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {language === 'ar' ? 'إضافة اللون' : 'Add Color'}
                  </Button>
                </div>
              </div>

              {/* Colors List */}
              <div className="flex flex-wrap gap-3">
                {newProduct.colors.map((color, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${color.available ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                  >
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: color.value }}
                      title={color.value}
                    />
                    <span className="text-sm font-medium">{color.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleColorAvailability(color.value)}
                        className={`p-1 rounded ${color.available
                          ? 'text-green-600 hover:text-green-800'
                          : 'text-gray-400 hover:text-gray-600'
                          }`}
                        title={color.available ?
                          (language === 'ar' ? 'غير متاح' : 'Make unavailable') :
                          (language === 'ar' ? 'متاح' : 'Make available')
                        }
                      >
                        {color.available ? '✓' : '✗'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeColor(color.value)}
                        className="text-red-500 hover:text-red-700 p-1 rounded"
                        title={language === 'ar' ? 'حذف اللون' : 'Remove color'}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {newProduct.colors.length === 0 && (
                <div className="text-center text-gray-500 py-4 border-2 border-dashed rounded-lg">
                  <Palette className="mx-auto h-8 w-8 mb-2" />
                  <p>{language === 'ar' ? 'لم تتم إضافة أي ألوان بعد' : 'No colors added yet'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="category">{language === 'ar' ? 'الفئة' : 'Category'} *</Label>
            </div>
            <Select
              value={newProduct.category}
              onValueChange={(value) => handleSelectChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={language === 'ar' ? 'اختر الفئة' : 'Select category'} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: any) => (
                  <SelectItem key={category._id} value={category._id}>
                    {language === 'ar' ? category.name : category.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">{language === 'ar' ? 'الحالة' : 'Status'}</Label>
            <Select
              value={newProduct.status}
              onValueChange={(value: 'available' | 'pending') => handleSelectChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">
                  {language === 'ar' ? 'متاح' : 'Available'}
                </SelectItem>
                <SelectItem value="pending">
                  {language === 'ar' ? 'قيد الانتظار' : 'Pending'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Images */}
          <div>
            <Label htmlFor="images">{language === 'ar' ? 'الصور' : 'Images'} *</Label>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {newProduct.images.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imageUrl}
                      alt={`Preview ${index}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 -translate-y-1/2 translate-x-1/2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <ImageUploader onUpload={handleImageUpload} />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span>{language === 'ar' ? 'جاري الإضافة...' : 'Adding...'}</span>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {language === 'ar' ? 'إضافة' : 'Add'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}