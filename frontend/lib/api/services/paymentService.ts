import apiServices from '@/lib/api';

const { api } = apiServices;

export const paymentService = {
  // Fetch available payment methods
  getPaymentMethods: () => api.get('/api/payments/methods'),

  // Create Paymob payment session (supports CARD, WALLET, INSTAPAY, etc.)
  createPaymentSession: async (data: {
    orderId: string;
    amount?: number;
    paymentMethod?: string;
    walletPhone?: string;
  }) => {
    try {
      const response = await api.post('/api/payments/create-session', data, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  verifyPaymobPayment: async (data: Record<string, unknown>) => {
    try {
      const response = await api.post('/api/payments/create-session/verify', data, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
