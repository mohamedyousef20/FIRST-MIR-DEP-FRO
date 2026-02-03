import apiServices from '@/lib/api';


const { api } = apiServices;

// Minimal shape used by admin UI
export interface Order {
  _id: string;
  id?: string; // some components use plain id string
  customer?: { name?: string; email?: string; phone?: string };
  createdAt: string;
  totalAmount?: number;
  orderNumber?: string;
  paymentStatus?: string;
  status: string;
}

// Order service functions
export const orderService = {
  // Get all orders
  getAllOrders: async (): Promise<Order[]> => {
    try {
      const { data } = await api.get<Order[]>('/api/orders');
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<Order> => {
    try {
      const { data } = await api.get<Order>(`/api/orders/${id}`);
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Create new order
  createOrder: async (orderData: Omit<Order, '_id' | 'createdAt'>): Promise<Order> => {
    try {
      const { data } = await api.post<Order>('/api/orders', orderData);
      return data
    } catch (error) {
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    try {
      const { data } = await api.put<Order>(`/api/orders/${orderId}/status`, { status });
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Update payment status
  updatePaymentStatus: async (orderId: string, status: string): Promise<Order> => {
    try {
      const { data } = await api.put<Order>(`/api/orders/${orderId}/payment-status`, { status });
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<Order> => {
    try {
      const { data } = await api.put<Order>(`/api/orders/${orderId}/cancel`);
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Confirm delivery
  confirmDelivery: async (id: string, code: string): Promise<Order> => {
    try {
      const { data } = await api.post<Order>(`/api/orders/${id}/delivery`, { code });
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Generate verification code
  generateVerificationCode: async (orderId: string): Promise<{ code: string }> => {
    try {
      const { data } = await api.post<{ code: string }>(`/api/orders/${orderId}/code`);
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Verify delivery
  verifyDelivery: async (orderId: string, code: string): Promise<Order> => {
    try {
      const { data } = await api.post<Order>(`/api/orders/${orderId}/verify-delivery`, { code });
      return data;
    } catch (error) {
      throw error;
    }
  }
};
