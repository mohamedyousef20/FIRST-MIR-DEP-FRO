import apiServices from '@/lib/api';

const { api } = apiServices;

export const cartService = {
  async getCart() {
    const response = await api.get('/api/cart');
    return response.data;
  },

  async addToCart(data: { productId: string; quantity: number }) {
    const response = await api.post('/api/cart', data);
    return response.data;
  },

  async updateCartItem(itemId: string, quantity: number) {
    const response = await api.patch(`/api/cart/${itemId}`, { quantity });
    return response.data;
  },

  async removeFromCart(itemId: string) {
    const response = await api.delete(`/api/cart/${itemId}`);
    return response.data;
  },

  async clearCart() {
    const response = await api.delete('/api/cart');
    return response.data;
  },
};
