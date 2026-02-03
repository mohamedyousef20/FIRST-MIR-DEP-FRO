"use client"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Megaphone } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { productService } from "@/lib/api"
import { toast } from "sonner"
import { ProductCard } from "./ProductCard"

interface Product {
  _id?: string;
  id: number;
  title: string;
  nameEn: string;
  images: string;
  price: number;
  oldPrice?: number;
  ratings: number;
  count: number;
  isNew?: boolean;
  brand?: string;
  quantity?: number;
}

interface FeaturedProductsProps {
  title: string;
}

export function FeaturedProducts({ title }: FeaturedProductsProps) {
  const { language, t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State for products and loading status
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getFeaturedProducts();
        //console.log(response.data, 'getFeaturedProducts')
        if (response.data) {
          setProducts(response?.data.products);
        } else {
          setError((t as any)('products.loadError'));
          toast.error(language === 'ar' ? 'فشل تحميل المنتجات' : 'Failed to load products');
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError((t as any)('products.loadError'));
        toast.error(language === 'ar' ? 'فشل تحميل المنتجات' : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      if (direction === 'left') {
        scrollContainerRef.current.scrollLeft -= scrollAmount;
      } else {
        scrollContainerRef.current.scrollLeft += scrollAmount;
      }
    }
  };

  const toggleWishlist = (productId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        toast.success((t as any)('wishlist.removed'));
      } else {
        newFavorites.add(productId);
        toast.success((t as any)('wishlist.added'));
      }
      return newFavorites;
    });
  };

  const addToCart = (productId: number) => {
    // Implement your add to cart logic here
    toast.success((t as any)('cart.addSuccess'));
  };//TODO

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">{title}</h2>

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={(product as any)._id ?? product.id}
              product={product as any}
              language={language}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <Megaphone className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">
            {language === "ar" ? "لا توجد منتجات في هذا التصنيف" : "No products found in this category"}
          </p>
        </div>
      )}
    </div>
  );
}