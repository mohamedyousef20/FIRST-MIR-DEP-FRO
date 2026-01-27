import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const userService = {
  // ... existing methods

  generateVerificationCode: async (email: string) => {
    const response = await axios.post(`${API_URL}/auth/generate-verification-code`, { email });
    return response;
  },

  sendVerificationEmail: async ({ email, code }: { email: string; code: string }) => {
    const response = await axios.post(`${API_URL}/auth/send-verification-email`, { email, code });
    return response;
  },

  verifyEmail: async ({ email, verificationCode }: { email: string; verificationCode: string }) => {
    const response = await axios.post(`${API_URL}/auth/verify-email`, { email, verificationCode });
    return response;
  },
};
