"use client"
import { useEffect, useState } from 'react';
import { CategoryCard } from '@/components/CategoryCard';
import Link from 'next/link';
import { categoryService } from '@/lib/api';
import { MirvoryPageLoader } from '@/components/MirvoryLoader';

interface Category {
  _id: string;
  name: string;
  nameEn: string;
  [key: string]: any; // allow additional fields
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsCount, setProductsCount] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getCategories();

        if (response.data) {
          setCategories(response.data);

          // جلب عدد المنتجات لكل فئة
          const counts: { [key: string]: number } = {};
          for (const category of response.data) {
            try {
              const productsResponse = await categoryService.getProductsByCategory(category._id, {
                limit: 1,
                page: 1
              });

              // Use the correct response structure
              counts[category._id] = productsResponse.data.pagination.total || 0;

              //console.log(`Category ${category.name}: ${counts[category._id]} products`);
            } catch (err) {
              console.error(`Error fetching products count for category ${category._id}:`, err);
              counts[category._id] = 0;
            }
          }
          setProductsCount(counts);
        } else {
          setError('لا توجد فئات متاحة');
        }
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.response?.data?.message || 'حدث خطأ أثناء جلب الفئات');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <MirvoryPageLoader text={"جاري التحميل..."} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-500 text-center">تصنيفات المنتجات</h1>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">لا توجد فئات متاحة حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category: Category) => (
            <Link
              key={category._id}
              href={`/categories/${category._id}/products`}
              className="block transition-transform hover:scale-105"
            >
              <CategoryCard
                category={category}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer h-full"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;