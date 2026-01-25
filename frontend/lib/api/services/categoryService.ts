import apiServices from '@/lib/api';

const { api } = apiServices;

export const categoryService = {
  // Get all categories
  async getCategories() {
    try {
      const response = await api.get('/api/categories');
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Get category by ID
  async getCategoryById(categoryId: string) {
    try {
      const response = await api.get(`/api/categories/${categoryId}`);
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Create new category
  async createCategory(categoryData: {
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    image?: string;
    status?: 'active' | 'inactive';
  }) {
    try {
      const response = await api.post('/api/categories', categoryData);
      //console.log(response,'response from category')
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Get products by category
  async getProductsByCategory(categoryId: string, params: {
    limit?: number;
    page?: number;
    sort?: string;
  } = {}) {
    try {
      const response = await api.get(`/api/categories/${categoryId}/products`, {
        params: {
          ...params,
          limit: params.limit || 12,
          page: params.page || 1,
          sort: params.sort || '-createdAt'
        }
      });
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Update category
  async updateCategory(categoryId: string, categoryData: {
    name?: string;
    nameEn?: string;
    description?: string;
    descriptionEn?: string;
    image?: string;
    status?: 'active' | 'inactive';
  }) {
    try {
      const response = await api.put(`/api/categories/${categoryId}`, categoryData);
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Delete category
  async deleteCategory(categoryId: string) {
    try {
      const response = await api.delete(`/api/categories/${categoryId}`);
      return response;
    } catch (error: any) {
      throw error;
    }
  }
};
