"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingCart, Heart, Star, Filter, X, AlertCircle, Megaphone, Truck, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { categoryService } from "@/lib/api"

// Define Product type
interface Product {
  brand?: string | { _id: string; name: string };
  _id: string;
  title: string;
  description: string;
  images: string[];
  sizes: string[];
  price: number;
  status: 'available' | 'sold';
  sellerPercentage: number;
  isApproved: boolean;
  category: {
    _id: string;
    name: string;
    nameEn: string;
  };
  isFeatured: boolean;
  ratings?: {
    average: number;
    count: number;
    distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}



// Mock announcements
const announcements = [
  {
    id: '1',
    title: {
      ar: "شحن مجاني على جميع الطلبات فوق 500 ج.م",
      en: "Free shipping on all orders over 500 EGP",
    },
    type: "info",
    icon: Truck,
  },
  {
    id: '2',
    title: {
      ar: "خصم 30% على جميع الكوتشيات الميرور",
      en: "30% off all Mirror Sneakers",
    },
    type: "promotion",
    icon: Megaphone,
  },
];

export default function CategoryProductsGrid() {
  const { language, t } = useLanguage();
  const params = useParams();
  const rawCategoryParam = params?.id as string | string[] | undefined;
  const categoryId = Array.isArray(rawCategoryParam) ? rawCategoryParam[0] : rawCategoryParam;

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string; count: number }[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortOption, setSortOption] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch category details and products
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!categoryId) return;

      setIsLoading(true);
      setError(null);
      try {
        // Fetch category details
        const categoryResponse = await categoryService.getCategoryById(categoryId);
        //console.log(categoryResponse, 'categoryResponse')
        setCategory(categoryResponse.data);

        // Fetch products for this category
        await fetchCategoryProducts();
      } catch (error: any) {
        console.error("Error fetching category data:", error);
        setError(language === "ar" ? "خطأ في جلب بيانات الفئة" : "Error fetching category data");
        toast.error(language === "ar" ? "خطأ في جلب بيانات الفئة" : "Error fetching category data");
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryId, language]);

  // Fetch products when filters change
  const fetchCategoryProducts = async () => {
    if (!categoryId) return;

    setIsLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sort: sortOption === "newest" ? "-createdAt" :
          sortOption === "priceHighToLow" ? "-price" :
            sortOption === "priceLowToHigh" ? "price" :
              sortOption === "topRated" ? "-ratings.average" : "-createdAt",
      };

      const response = await categoryService.getProductsByCategory(categoryId, params);
      //console.log(response, 're')
      if (response.data) {
        const fetchedProducts: Product[] = response.data.products || [];
        setProducts(fetchedProducts);

        // Derive brands list with counts
        const brandMap: Record<string, { id: string; name: string; count: number }> = {};
        fetchedProducts.forEach((p) => {
          const brandName = typeof p.brand === "string" ? p.brand : p.brand?.name;
          if (brandName) {
            if (!brandMap[brandName]) {
              brandMap[brandName] = { id: brandName, name: brandName, count: 0 };
            }
            brandMap[brandName].count += 1;
          }
        });
        setBrands(Object.values(brandMap));

        setTotalProducts(response.data.pagination?.total || fetchedProducts.length);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error: any) {
      console.error("Error fetching category products:", error);
      setError(language === "ar" ? "خطأ في جلب المنتجات" : "Error fetching products");
      toast.error(language === "ar" ? "خطأ في جلب المنتجات" : "Error fetching products");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products when filters or pagination changes
  useEffect(() => {
    if (categoryId) {
      fetchCategoryProducts();
    }
  }, [selectedBrands, priceRange, sortOption, page, categoryId]);

  // Rotate announcements
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBrandChange = (brandId: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
    setPage(1);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    setPage(1);
  };

  const resetFilters = () => {
    setSelectedBrands([]);
    setPriceRange([0, 2000]);
    setSortOption("newest");
    setPage(1);
  };

  const toggleWishlist = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        toast.error(language === "ar" ? "تمت الإزالة من المفضلة" : "Removed from wishlist");
      } else {
        newFavorites.add(productId);
        toast.success(language === "ar" ? "تمت الإضافة إلى المفضلة" : "Added to wishlist");
      }
      return newFavorites;
    });
  };

  const addToCart = (productId: string) => {
    toast.success(language === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart");
  };

  const getAnnouncementStyle = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-300";
      case "promotion":
        return "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-900 dark:text-green-300";
      case "warning":
        return "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-300";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="py-6">
      <div className="flex flex-col gap-6">
        {/* Category Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {category ? (language === "ar" ? category.name : category.nameEn) : (language === "ar" ? "الفئة" : "Category")}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {language === "ar"
                  ? `عرض ${totalProducts} منتج في هذه الفئة`
                  : `Showing ${totalProducts} products in this category`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1 md:hidden">
                    <Filter className="h-4 w-4" />
                    {language === "ar" ? "الفلاتر" : "Filters"}
                  </Button>
                </SheetTrigger>
                <SheetContent side={language === "ar" ? "right" : "left"} className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>{language === "ar" ? "الفلاتر" : "Filters"}</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <Accordion type="multiple" className="w-full" defaultValue={["brands", "price"]}>
                      <AccordionItem value="brands">
                        <AccordionTrigger>{language === "ar" ? "الماركات" : "Brands"}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {brands.map((brand) => (
                              <div key={brand.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                                <Checkbox
                                  id={`brand-${brand.id}-mobile`}
                                  checked={selectedBrands.includes(brand.name)}
                                  onCheckedChange={() => handleBrandChange(brand.name)}
                                />
                                <Label htmlFor={`brand-${brand.id}-mobile`} className="flex-1 text-sm font-normal">
                                  {brand.name} ({brand.count})
                                </Label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="price">
                        <AccordionTrigger>{language === "ar" ? "السعر" : "Price"}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <Slider
                              value={priceRange}
                              max={2000}
                              step={50}
                              onValueChange={handlePriceChange}
                            />
                            <div className="flex items-center justify-between">
                              <span>
                                {priceRange[0]} {language === "ar" ? "ج.م" : "EGP"}
                              </span>
                              <span>
                                {priceRange[1]} {language === "ar" ? "ج.م" : "EGP"}
                              </span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                  <SheetFooter>
                    <SheetClose asChild>
                      <Button variant="outline" onClick={resetFilters} className="w-full">
                        {language === "ar" ? "إعادة ضبط الفلاتر" : "Reset Filters"}
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button className="w-full">{language === "ar" ? "تطبيق الفلاتر" : "Apply Filters"}</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              <Select value={sortOption} onValueChange={handleSortChange}>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder={language === "ar" ? "ترتيب حسب" : "Sort by"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{language === "ar" ? "الأحدث" : "Newest"}</SelectItem>
                  <SelectItem value="priceHighToLow">{language === "ar" ? "السعر: من الأعلى للأقل" : "Price: High to Low"}</SelectItem>
                  <SelectItem value="priceLowToHigh">{language === "ar" ? "السعر: من الأقل للأعلى" : "Price: Low to High"}</SelectItem>
                  <SelectItem value="topRated">{language === "ar" ? "الأعلى تقييماً" : "Top Rated"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          {/* Filters Sidebar */}
          <div className="hidden md:block space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{language === "ar" ? "الماركات" : "Brands"}</h3>
                {selectedBrands.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedBrands([])}>
                    <X className="h-4 w-4 mr-1" />
                    {language === "ar" ? "مسح" : "Clear"}
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <div key={brand.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={selectedBrands.includes(brand.name)}
                      onCheckedChange={() => handleBrandChange(brand.name)}
                    />
                    <Label htmlFor={`brand-${brand.id}`} className="flex-1 text-sm font-normal">
                      {brand.name} ({brand.count})
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium">{language === "ar" ? "السعر" : "Price"}</h3>
              <div className="space-y-4">
                <Slider
                  value={priceRange}
                  max={2000}
                  step={50}
                  onValueChange={handlePriceChange}
                />
                <div className="flex items-center justify-between">
                  <span>
                    {priceRange[0]} {language === "ar" ? "ج.م" : "EGP"}
                  </span>
                  <span>
                    {priceRange[1]} {language === "ar" ? "ج.م" : "EGP"}
                  </span>
                </div>
              </div>
            </div>
            {(selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 2000) && (
              <Button variant="outline" onClick={resetFilters} className="w-full">
                {language === "ar" ? "إعادة ضبط الفلاتر" : "Reset Filters"}
              </Button>
            )}
          </div>

          {/* Products Grid */}
          <div className="space-y-6">
            {/* Announcements Section */}
            <Alert className={`transition-all duration-500 ${getAnnouncementStyle(announcements[currentAnnouncement].type)}`}>
              {React.createElement(announcements[currentAnnouncement].icon, { className: "h-4 w-4" })}
              <AlertDescription>
                {language === "ar"
                  ? announcements[currentAnnouncement].title.ar
                  : announcements[currentAnnouncement].title.en}
              </AlertDescription>
            </Alert>

            {/* Error state */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading state */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden shadow-md animate-pulse">
                    <div className="aspect-square bg-muted"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-5 bg-muted rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                      <div className="h-5 bg-muted rounded w-1/2"></div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex gap-2">
                      <div className="h-8 bg-muted rounded w-3/4"></div>
                      <div className="h-8 bg-muted rounded w-1/4"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {language === "ar" ? "لا توجد منتجات" : "No products found"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === "ar"
                    ? "لا توجد منتجات في هذه الفئة حالياً"
                    : "No products available in this category at the moment"
                  }
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  {language === "ar" ? "إعادة ضبط الفلاتر" : "Reset Filters"}
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <Card
                      key={product._id}
                      className="overflow-hidden group shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <Link href={`/products/${product._id}`} className="relative block">
                        <div className="aspect-square overflow-hidden">
                          <Image
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.title}
                            width={300}
                            height={300}
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        {(product.ratings?.average ?? 0) > 4.5 && (
                          <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                            {language === "ar" ? "مميز" : "Top Rated"}
                          </Badge>
                        )}
                        {product.isFeatured && (
                          <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600">
                            {language === "ar" ? "رائج" : "Featured"}
                          </Badge>
                        )}
                        {product.status === 'sold' && (
                          <Badge className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center">
                            {language === "ar" ? "مباع" : "Sold"}
                          </Badge>
                        )}
                      </Link>
                      <CardContent className="p-3 sm:p-4">
                        <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                          {language === "ar" ? product.category.name : product.category.nameEn}
                        </div>
                        <Link href={`/products/${product._id}`} className="block">
                          <h3 className="font-medium text-sm sm:text-base leading-tight mb-1 line-clamp-2">
                            {product.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current text-yellow-400" />
                          <span className="text-xs sm:text-sm font-medium">
                            {product?.ratings?.average?.toFixed(1) || "0.0"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({product?.ratings?.count || 0})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm sm:text-base">
                            {product.price} {language === "ar" ? "ج.م" : "EGP"}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 sm:p-4 pt-0 flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={(e) => {
                            e.preventDefault()
                            toggleWishlist(product._id)
                          }}
                          disabled={product.status === 'sold'}
                        >
                          <Heart className={`h-4 w-4 ${favorites.has(product._id) ? "fill-red-500 text-red-500" : ""}`} />
                          <span className="sr-only">
                            {language === "ar" ? "إضافة إلى المفضلة" : "Add to wishlist"}
                          </span>
                        </Button>
                        <Button
                          className="w-full text-xs sm:text-sm"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            addToCart(product._id)
                          }}
                          disabled={product.status === 'sold'}
                        >
                          <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          {language === "ar" ? "أضف إلى السلة" : "Add to Cart"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t pt-6">
                    <div className="flex flex-1 items-center justify-between sm:hidden">
                      <Button
                        variant="outline"
                        className="-ml-px"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {language === "ar" ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
                      </span>
                      <Button
                        variant="outline"
                        className="-ml-px"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="hidden sm:flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        {language === "ar" ? "السابق" : "Previous"}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {language === "ar" ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                      >
                        {language === "ar" ? "التالي" : "Next"}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}