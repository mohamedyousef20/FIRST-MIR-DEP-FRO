export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    timeout: 10000,
    endpoints: {
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        refresh: '/api/auth/refresh-token',
        me: '/api/auth/me',
        logout: '/api/auth/logout',
        changePassword: '/api/auth/change-password',

      },
      users: {
        base: '/api/users',
        profile: '/api/users/profile',
      },
      products: {
        base: '/api/products',
        featured: '/api/products/featured',
        search: '/api/products/search',
      },
      categories: {
        base: '/api/categories',
      },
      orders: {
        base: '/api/orders',
        myOrders: '/api/orders/my-orders',
      },
    },
  },
  storage: {
    tokenKey: 'access_token',
    refreshTokenKey: 'refresh_token',
    userKey: 'user',
  },
  auth: {
    tokenRefreshThreshold: 300, // 5 minutes in seconds
  },
} as const;
