import apiClient from '../apiClient';

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface ProductCategory {
  _id: string;
  name: string;
  slug?: string;
}

export interface ProductSeller {
  _id: string;
  name: string;
  avatar?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  discountPercentage?: number;
  images: ProductImage[];
  category: ProductCategory;
  seller: ProductSeller;
  rating?: number;
  numReviews?: number;
  countInStock: number;
  isFeatured?: boolean;
  isApproved?: boolean;
  status?: 'active' | 'inactive' | 'out_of_stock';
  specifications?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isApproved?: boolean;
  status?: string;
  discountPercentage?: number;
  sellerId?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

const productService = {
  // Get all products with optional filters and pagination
  getProducts: async (filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get<PaginatedResponse<Product>>(`/products?${params.toString()}`);
    return response.data;
  },

  // Get a single product by ID
  getProductById: async (productId: string): Promise<Product> => {
    const response = await apiClient.get<{data: Product}>(`/products/${productId}`);
    return response.data.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit: number = 8): Promise<Product[]> => {
    const response = await apiClient.get<{data: Product[]}>(`/products/featured/product?limit=${limit}`);
    return response.data.data;
  },

  // Get new arrivals
  getNewArrivals: async (limit: number = 8): Promise<Product[]> => {
    const response = await apiClient.get<{data: Product[]}>(`/products/new/product?limit=${limit}&sort=-createdAt`);
    return response.data.data;
  },

  // Search products
  searchProducts: async (query: string, filters: Omit<ProductFilters, 'search'> = {}): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams({ q: query });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get<PaginatedResponse<Product>>(`/search?${params.toString()}`);
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId: string, filters: Omit<ProductFilters, 'category'> = {}): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams({ category: categoryId });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get<PaginatedResponse<Product>>(`/products?${params.toString()}`);
    return response.data;
  },

  // Get related products (by same category)
  getRelatedProducts: async (productId: string, categoryId: string, limit: number = 4): Promise<Product[]> => {
    const response = await apiClient.get<{data: Product[]}>(`/products?category=${categoryId}&limit=${limit}&exclude=${productId}`);
    return response.data.data;
  },
};

export default productService;
