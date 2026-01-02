import apiClient from '../api/apiClient';

export const authService = {
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  verifySecret: async (secretPassword) => {
    const response = await apiClient.post('/auth/verify-secret', { secretPassword });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyOTP: async (email, otp, token) => {
    const response = await apiClient.post('/auth/verify-otp', { email, otp, token });
    return response.data;
  },

  resetPassword: async (email, otp, token, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', { email, otp, token, newPassword });
    return response.data;
  }
};