import { useState, useEffect, useCallback } from 'react';
import productService, { Product, ProductFilters, PaginatedResponse } from '../lib/api/services/product.service';

interface UseProductsOptions extends Omit<ProductFilters, 'page' | 'limit'> {
  initialPage?: number;
  pageSize?: number;
  enabled?: boolean;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const {
    initialPage = 1,
    pageSize = 10,
    enabled = true,
    ...filters
  } = options;

  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchProducts = useCallback(async (currentPage: number) => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await productService.getProducts({
        ...filters,
        page: currentPage,
        limit: pageSize,
      });

      setData(prev => ({
        ...response,
        data: currentPage === 1 
          ? response.data 
          : [...(prev?.data || []), ...response.data],
      }));

      setHasMore(currentPage < response.totalPages);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch products'));
    } finally {
      setIsLoading(false);
    }
  }, [enabled, JSON.stringify(filters), pageSize]);

  // Initial fetch or when filters change
  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [fetchProducts]);

  // Load more products
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  }, [fetchProducts, hasMore, isLoading, page]);

  // Refresh products
  const refresh = useCallback(() => {
    setPage(1);
    return fetchProducts(1);
  }, [fetchProducts]);

  return {
    // Data
    products: data?.data || [],
    pagination: {
      page,
      total: data?.total || 0,
      totalPages: data?.totalPages || 0,
      hasMore,
    },
    
    // Loading states
    isLoading,
    isLoadingMore: isLoading && page > 1,
    isRefreshing: isLoading && page === 1,
    
    // Error state
    error,
    
    // Actions
    loadMore,
    refresh,
    setPage: (newPage: number) => setPage(Math.max(1, newPage)),
  };
};
