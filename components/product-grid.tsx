"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ShoppingCart,
  Heart,
  Star,
  Filter,
  X,
  AlertCircle,
  Megaphone,
  Truck,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react"
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
import { ProductCard } from "@/components/ProductCard"
import { ProductSearch } from "@/components/ProductSearch"
import { announcementService, categoryService, productService, wishlistService, brandService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthProvider"

// Types
interface Product {
  _id: string;
  title: string;
  description: string;
  images: string[];
  sizes: string[];
  colors: Array<{
    name: string;
    value: string;
    available: boolean;
  }>;
  price: number;
  discountPercentage: number;
  discountedPrice: number;
  quantity: number;
  sold: number;
  status: 'available' | 'sold';
  sellerPercentage: number;
  isApproved: boolean;
  category: {
    _id: string;
    name: string;
    nameEn: string;
  };
  isFeatured: boolean;
  ratings: {
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

interface Category {
  _id: string;
  name: string;
  nameEn: string;
  description?: string;
  image?: string;
  status: 'active' | 'inactive';
  productCount?: number;
}

interface Brand {
  id: string;
  name: string;
  count: number;
}

interface Announcement {
  _id: string;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  image?: string;
  type: "info" | "promotion" | "warning";
  status: "active" | "inactive";
  isMain: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface FilterState {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  sort: string;
  searchQuery: string;
}

// Constants
const INITIAL_FILTERS: FilterState = {
  categories: [],
  brands: [],
  priceRange: [0, 10000],
  sort: "newest",
  searchQuery: ""
};

const SORT_OPTIONS = [
  { value: "newest", label: { ar: "الأحدث", en: "Newest" } },
  { value: "priceHighToLow", label: { ar: "السعر: من الأعلى للأدنى", en: "Price: High to Low" } },
  { value: "priceLowToHigh", label: { ar: "السعر: من الأدنى للأعلى", en: "Price: Low to High" } },
  { value: "topRated", label: { ar: "الأعلى تقييماً", en: "Top Rated" } },
];

// Fallback brands list (used when backend returns none)
const DEFAULT_BRANDS: Brand[] = [
  { id: "nike", name: "Nike", count: 0 },
  { id: "adidas", name: "Adidas", count: 0 },
  { id: "puma", name: "Puma", count: 0 },
  { id: "reebok", name: "Reebok", count: 0 },
  { id: "under-armour", name: "Under Armour", count: 0 },
];



const getAnnouncementIcon = (type: string) => {
  switch (type) {
    case "info":
      return Truck;
    case "promotion":
      return Megaphone;
    case "warning":
      return AlertCircle;
    default:
      return Megaphone;
  }
};

const getAnnouncementStyle = (type: string) => {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-300",
    promotion: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-900 dark:text-green-300",
    warning: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-300"
  };
  return styles[type as keyof typeof styles] || "bg-muted";
};

// Helper function to check if announcement is currently active
const isAnnouncementActive = (announcement: Announcement): boolean => {
  if (announcement.status !== "active") return false;

  const now = new Date();
  const startDate = new Date(announcement.startDate);
  const endDate = new Date(announcement.endDate);

  return now >= startDate && now <= endDate;
};

export function ProductGrid() {
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isAuthenticated = Boolean(user?.id || user?._id);

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    totalPages: 1,
    totalProducts: 0
  });
  const [uiState, setUiState] = useState({
    isFilterOpen: false,
    isLoading: false,
    isInitialLoading: false,
    currentAnnouncement: 0,
    error: null as string | null,
    favorites: new Set<string>()
  });

  const fetchWishlistFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setUiState(prev => ({ ...prev, favorites: new Set() }));
      return;
    }

    try {
      const response = await wishlistService.getWishlist();
      const wishlistData = response.data?.data;
      const products = wishlistData?.products ?? [];

      const favoriteIds = products
        .map((item: any) => {
          const product = item?.product;
          if (!product) return null;
          if (typeof product === "string") return product;
          return product._id;
        })
        .filter(Boolean) as string[];

      setUiState(prev => ({ ...prev, favorites: new Set(favoriteIds) }));
    } catch (error) {
      console.error("Error fetching wishlist favorites:", error);
    }
  }, [isAuthenticated]);

  // Memoized values
  const hasActiveFilters = React.useMemo(() =>
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 2000 ||
    filters.searchQuery.trim() !== ""
    , [filters]);

  const activeAnnouncements = React.useMemo(() =>
    announcements.filter(announcement => isAnnouncementActive(announcement))
    , [announcements]);

  // Data fetching
  const fetchInitialData = useCallback(async () => {
    try {
      setUiState(prev => ({ ...prev, isInitialLoading: true, error: null }));

      const [categoriesResponse, announcementsResponse, brandsResponse] = await Promise.all([
        categoryService.getCategories(),
        announcementService.getAnnouncements(),
        brandService.getBrands()
      ]);

      setCategories(categoriesResponse.data || []);
      // only keep announcements that are NOT main
      const nonMainAnnouncements = (announcementsResponse.data || []).filter((a: any) => !a.isMain);
      setAnnouncements(nonMainAnnouncements);

      // update brands list from backend, fallback to default if empty
      if (Array.isArray(brandsResponse.data) && brandsResponse.data.length) {
        setBrands(brandsResponse.data);
      }

    } catch (error) {
      console.error("Error fetching initial data:", error);
      const message = language === "ar" ? "فشل تحميل البيانات" : "Failed to load data";
      setUiState(prev => ({
        ...prev,
        error: message
      }));
      toast.error(message);
    } finally {
      setUiState(prev => ({ ...prev, isInitialLoading: false }));
    }
  }, [language]);

  const fetchProducts = useCallback(async () => {
    try {
      setUiState(prev => ({ ...prev, isLoading: true, error: null }));

      let response;

      // If there's a search query, use search endpoint
      if (filters.searchQuery.trim()) {
        const searchParams = {
          page: pagination.page,
          limit: pagination.pageSize,
          category: filters.categories.length > 0 ? filters.categories.join(',') : undefined,
          minPrice: filters.priceRange[0],
          maxPrice: filters.priceRange[1],
          sort: filters.sort === "newest" ? "-createdAt" :
            filters.sort === "priceHighToLow" ? "-price" :
              filters.sort === "priceLowToHigh" ? "price" :
                filters.sort === "topRated" ? "-ratings.average" : undefined,
        };
        response = await productService.searchProducts(filters.searchQuery, searchParams);
      } else {
        // Otherwise use regular products endpoint with filters
        const params = {
          page: pagination.page,
          limit: pagination.pageSize,
          category: filters.categories.length > 0 ? filters.categories.join(',') : undefined,
          brand: filters.brands.length > 0 ? filters.brands.join(',') : undefined,
          minPrice: filters.priceRange[0],
          maxPrice: filters.priceRange[1],
          sort: filters.sort === "newest" ? "-createdAt" :
            filters.sort === "priceHighToLow" ? "-price" :
              filters.sort === "priceLowToHigh" ? "price" :
                filters.sort === "topRated" ? "-ratings.average" : undefined,
          isApproved: true,
          status: 'available',
        };
        response = await productService.getProducts(params);
      }

      const productsData = Array.isArray(response.data) ? response.data : response.data?.products || [];

      setProducts(productsData);

      // Update pagination info based on new backend format
      if (response.data?.pagination) {
        const { currentPage, totalPages, limit } = response.data.pagination;
        setPagination(prev => ({
          ...prev,
          page: currentPage,
          pageSize: limit,
          totalPages
        }));
      }

    } catch (error) {
      console.error("Error fetching products:", error);
      const message = language === "ar" ? "فشل جلب المنتجات" : "Failed to load products";
      setUiState(prev => ({
        ...prev,
        error: message
      }));
      toast.error(message);
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  }, [filters, pagination.page, pagination.pageSize, language]);

  useEffect(() => {
    fetchWishlistFavorites();
  }, [fetchWishlistFavorites]);

  // Effects
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Read search query from URL params
  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setFilters(prev => ({ ...prev, searchQuery }));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Announcements rotation
  useEffect(() => {
    if (activeAnnouncements.length === 0) return;

    const interval = setInterval(() => {
      setUiState(prev => {
        // إذا لم يكن هناك إعلانات نشطة، توقف
        if (activeAnnouncements.length === 0) return prev;

        // الانتقال للإعلان التالي
        const nextAnnouncement = (prev.currentAnnouncement + 1) % activeAnnouncements.length;

        return {
          ...prev,
          currentAnnouncement: nextAnnouncement
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [activeAnnouncements]);
  // Filter handlers
  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleCategoryChange = useCallback((categoryId: string) => {
    if (categoryId === 'clear') {
      updateFilter('categories', []);
      return;
    }

    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  }, [updateFilter]);

  const handleBrandChange = useCallback((brandId: string) => {
    if (brandId === 'clear') {
      updateFilter('brands', []);
      return;
    }

    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brandId)
        ? prev.brands.filter(id => id !== brandId)
        : [...prev.brands, brandId]
    }));
  }, [updateFilter]);

  const handlePriceChange = useCallback((value: number[]) => {
    updateFilter('priceRange', value as [number, number]);
  }, [updateFilter]);

  const handleSortChange = useCallback((value: string) => {
    updateFilter('sort', value);
  }, [updateFilter]);

  const handleSearch = useCallback((query: string) => {
    updateFilter('searchQuery', query);
  }, [updateFilter]);

  const handleClearSearch = useCallback(() => {
    updateFilter('searchQuery', '');
  }, [updateFilter]);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // UI handlers
  const toggleWishlist = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      toast.error(language === "ar" ? "يرجى تسجيل الدخول لإدارة المفضلة" : "Please sign in to manage favorites");
      return;
    }

    const isCurrentlyFavorite = uiState.favorites.has(productId);

    try {
      await wishlistService.toggleWishlist(productId);

      setUiState(prev => {
        const newFavorites = new Set(prev.favorites);
        if (isCurrentlyFavorite) {
          newFavorites.delete(productId);
        } else {
          newFavorites.add(productId);
        }
        return { ...prev, favorites: newFavorites };
      });

      toast.success(isCurrentlyFavorite
        ? (language === "ar" ? "تمت الإزالة من المفضلة" : "Removed from wishlist")
        : (language === "ar" ? "تمت الإضافة إلى المفضلة" : "Added to wishlist")
      );
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error(language === "ar" ? "فشل تحديث المفضلة" : "Failed to update favorites");
    }
  }, [isAuthenticated, language, uiState.favorites]);

  const addToCart = async (productId: string) => {
    try {
      //console.log('Adding to cart:', productId);
      // await dispatch(addToCartAction({ productId, quantity: 1 })).unwrap();
      toast.success(language === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart");
    } catch (error) {
      toast.error(language === "ar" ? "فشل في إضافة المنتج إلى السلة" : "Failed to add product to cart");
    }
  };

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Render helpers
  const renderFilterSection = (title: string, items: any[], selectedItems: string[], onChange: (id: string) => void) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        {selectedItems.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => onChange('clear')}>
            <X className="h-4 w-4 mr-1" />
            {language === "ar" ? "مسح" : "Clear"}
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id || item._id} className="flex items-center space-x-2 rtl:space-x-reverse">
            <Checkbox
              id={`${title}-${item.id || item._id}`}
              checked={selectedItems.includes(item.id || item._id)}
              onCheckedChange={() => onChange(item.id || item._id)}
            />
            <Label htmlFor={`${title}-${item.id || item._id}`} className="flex-1 text-sm font-normal">
              {language === "ar" ? item.name : item.nameEn || item.name}
              {item.count !== undefined && ` (${item.count})`}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLoadingSkeleton = () => (
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
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">
        {language === "ar" ? "لا توجد منتجات" : "No products found"}
      </h3>
      <p className="text-muted-foreground mb-4">
        {language === "ar" ? "لا توجد منتجات تطابق معاييرك" : "No products match your criteria"}
      </p>
      <Button variant="outline" onClick={resetFilters}>
        {language === "ar" ? "إعادة ضبط الفلاتر" : "Reset Filters"}
      </Button>
    </div>
  );

  const renderPagination = () => (
    <div className="flex items-center justify-between border-t pt-6">
      {/* Mobile Pagination */}
      <div className="flex flex-1 items-center justify-between sm:hidden">
        <Button
          variant="outline"
          onClick={() => setPage(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          {language === "ar" ? `صفحة ${pagination.page}` : `Page ${pagination.page}`}
        </span>
        <Button
          variant="outline"
          onClick={() => setPage(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop Pagination */}
      <div className="hidden sm:flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => setPage(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          {language === "ar" ? "السابق" : "Previous"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {language === "ar"
            ? `صفحة ${pagination.page} من ${pagination.totalPages}`
            : `Page ${pagination.page} of ${pagination.totalPages}`
          }
        </span>
        <Button
          variant="outline"
          onClick={() => setPage(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
        >
          {language === "ar" ? "التالي" : "Next"}
        </Button>
      </div>
    </div>
  );

  const renderAnnouncement = () => {
    if (activeAnnouncements.length === 0) return null;

    const currentAnnouncement = activeAnnouncements[uiState.currentAnnouncement];
    const IconComponent = getAnnouncementIcon(currentAnnouncement.type);

    return (
      <Alert className={`transition-all duration-500 ${getAnnouncementStyle(currentAnnouncement.type)}`}>
        <IconComponent className="h-4 w-4" />
        <AlertDescription>
          {language === "ar" ? currentAnnouncement.title : currentAnnouncement.titleEn}
        </AlertDescription>
      </Alert>
    );
  };

  // Show initial loading state
  if (uiState.isInitialLoading) {
    return (
      <div className="py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            {language === "ar" ? "جاري التحميل..." : "Loading..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold tracking-tight">
              {language === "ar" ? "جميع المنتجات" : "All Products"}
            </h2>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Mobile Filter Trigger */}
              <Sheet open={uiState.isFilterOpen} onOpenChange={(open) => setUiState(prev => ({ ...prev, isFilterOpen: open }))}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1 md:hidden">
                    <Filter className="h-4 w-4" />
                    {t("categories")}
                  </Button>
                </SheetTrigger>

                <SheetContent side={language === "ar" ? "right" : "left"} className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>{t("categories")}</SheetTitle>
                  </SheetHeader>

                  <div className="py-4">
                    <Accordion type="multiple" className="w-full" defaultValue={["categories", "brands", "price"]}>
                      {/* Categories Accordion */}
                      <AccordionItem value="categories">
                        <AccordionTrigger>{t("categories")}</AccordionTrigger>
                        <AccordionContent>
                          {renderFilterSection(
                            t("categories"),
                            categories,
                            filters.categories,
                            handleCategoryChange
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      {/* Brands Accordion */}
                      <AccordionItem value="brands">
                        <AccordionTrigger>{t("brands")}</AccordionTrigger>
                        <AccordionContent>
                          {renderFilterSection(
                            t("brands"),
                            brands,
                            filters.brands,
                            handleBrandChange
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      {/* Price Accordion */}
                      <AccordionItem value="price">
                        <AccordionTrigger>{t("price")}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <Slider
                              value={filters.priceRange}
                              max={10000}
                              step={50}
                              onValueChange={handlePriceChange}
                            />
                            <div className="flex items-center justify-between">
                              <span>{filters.priceRange[0]} {language === "ar" ? "ج.م" : "EGP"}</span>
                              <span>{filters.priceRange[1]} {language === "ar" ? "ج.م" : "EGP"}</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  <SheetFooter className="flex flex-col gap-2">
                    {hasActiveFilters && (
                      <SheetClose asChild>
                        <Button variant="outline" onClick={resetFilters} className="w-full">
                          {language === "ar" ? "إعادة ضبط الفلاتر" : "Reset Filters"}
                        </Button>
                      </SheetClose>
                    )}
                    <SheetClose asChild>
                      <Button className="w-full">
                        {language === "ar" ? "تطبيق الفلاتر" : "Apply Filters"}
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {/* Sort Dropdown */}
              <Select value={filters.sort} onValueChange={handleSortChange}>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder={t("sort")} />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {language === "ar" ? option.label.ar : option.label.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Bar */}
          <ProductSearch
            onSearch={handleSearch}
            onClear={handleClearSearch}
            className="w-full"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden md:block space-y-6">
            {renderFilterSection(
              t("categories"),
              categories,
              filters.categories,
              handleCategoryChange
            )}

            {renderFilterSection(
              t("brands"),
              brands,
              filters.brands,
              handleBrandChange
            )}

            {/* Price Filter */}
            <div className="space-y-4">
              <h3 className="font-medium">{t("price")}</h3>
              <div className="space-y-4">
                <Slider
                  value={filters.priceRange}
                  max={2000}
                  step={50}
                  onValueChange={handlePriceChange}
                />
                <div className="flex items-center justify-between">
                  <span>{filters.priceRange[0]} {language === "ar" ? "ج.م" : "EGP"}</span>
                  <span>{filters.priceRange[1]} {language === "ar" ? "ج.م" : "EGP"}</span>
                </div>
              </div>
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters} className="w-full">
                {language === "ar" ? "إعادة ضبط الفلاتر" : "Reset Filters"}
              </Button>
            )}
          </div>

          {/* Products Section */}
          <div className="space-y-6">
            {/* Announcement */}
            {renderAnnouncement()}

            {/* Error State */}
            {uiState.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uiState.error}</AlertDescription>
              </Alert>
            )}

            {/* Products Grid */}
            {uiState.isLoading ? (
              renderLoadingSkeleton()
            ) : products.length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    language={language}
                    onAddToCart={addToCart}
                    ontoggleWishlist={toggleWishlist}
                    isFavorite={uiState.favorites.has(product._id)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!uiState.isLoading && products.length > 0 && renderPagination()}
          </div>
        </div>
      </div>
    </div>
  );
}