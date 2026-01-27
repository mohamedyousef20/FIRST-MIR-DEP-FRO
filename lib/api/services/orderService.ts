import apiServices from '@/lib/api';

const { api } = apiServices;

// Order service functions
export const orderService = {
  // Get all orders
  getOrders: async () => {
    try {
      const response = await api.get('/api/orders');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (id: number) => {
    try {
      const response = await api.get(`/api/orders/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new order
  createOrder: async (orderData: any) => {
    try {
      const response = await api.post('/api/orders', orderData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      const response = await api.put(`/api/orders/${orderId}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update payment status
  updatePaymentStatus: async (orderId: string, status: string) => {
    try {
      const response = await api.put(`/api/orders/${orderId}/payment-status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId: number) => {
    try {
      const response = await api.put(`/api/orders/${orderId}/cancel`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Confirm delivery
  confirmDelivery: async (id: number, code: string) => {
    try {
      const response = await api.post(`/api/orders/${id}/delivery`, { code });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Generate verification code
  generateVerificationCode: async (orderId: number) => {
    try {
      const response = await api.post(`/api/orders/${orderId}/code`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Verify delivery
  verifyDelivery: async (orderId: number, code: string) => {
    try {
      const response = await api.post(`/api/orders/${orderId}/verify-delivery`, { code });
      return response;
    } catch (error) {
      throw error;
    }
  }
};
