import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiService = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies on every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
apiService.interceptors.request.use(
  (config) => {
    // Do not attach tokens from localStorage. We rely on HTTP-only cookies.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle different error statuses
      switch (error.response.status) {
        case 401:
          // Unauthorized - let caller handle (or global axios instance handles refresh)
          throw error;
        case 403:
          // Forbidden
          throw new Error('Access denied');
        case 404:
          throw new Error('Resource not found');
        default:
          throw error;
      }
    }
    return Promise.reject(error);
  }
);

export { apiService };
