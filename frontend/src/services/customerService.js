import apiClient from '../api/apiClient';

export const customerService = {
  getCustomers: async () => {
    const response = await apiClient.get('/customers');
    return response.data;
  },

  getCustomerByPhone: async (phone) => {
    try {
      const response = await apiClient.get(`/customers/phone/${phone}`, {
        headers: { 'X-Silent-404': 'true' }
      });
      return response.data;
    } catch (error) {
      return null;
    }
  },

  getCustomerAnalytics: async () => {
    const response = await apiClient.get('/customers/analytics');
    return response.data;
  },

  getCustomerDirectory: async () => {
    const response = await apiClient.get('/customers/directory');
    return response.data;
  }
};