import apiServices from '@/lib/api';

const { api } = apiServices;

export const couponService = {
  getCoupons() {
    return api.get('/api/coupons');
  },

  getPublicCoupons() {
    return api.get('/api/coupons/public');
  },

  getCoupon(id: string) {
    return api.get(`/api/coupons/${id}`);
  },

  createCoupon(data: any) {
    return api.post('/api/coupons', data);
  },

  updateCoupon(id: string, data: any) {
    return api.put(`/api/coupons/${id}`, data);
  },

  deleteCoupon(id: string) {
    return api.delete(`/api/coupons/${id}`);
  },

  validateCoupon(code: string, subtotal: number) {
    return api.post('/api/coupons/validate', { code, subtotal });
  },

  removeCouponFromCart() {
    return api.delete('/api/coupons/remove');
  },
};

export default couponService;
