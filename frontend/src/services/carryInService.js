import apiClient from '../api/apiClient';

export const carryInService = {
  getCarryInServices: async () => {
    const response = await apiClient.get('/carry-in-services');
    return response.data;
  },

  createCarryInService: async (serviceData) => {
    const response = await apiClient.post('/carry-in-services', serviceData);
    return response.data;
  },

  completeCarryInService: async (serviceId, completeRemark) => {
    const response = await apiClient.post(`/carry-in-services/${serviceId}/complete`, {
      completeRemark
    });
    return response.data;
  },

  deliverCarryInService: async (serviceId, deliverRemark) => {
    const response = await apiClient.post(`/carry-in-services/${serviceId}/deliver`, {
      deliverRemark
    });
    return response.data;
  },

  getCarryInCustomerByPhone: async (phone) => {
    try {
      const response = await apiClient.get(`/carry-in-services/customers/phone/${phone}`, {
        headers: { 'X-Silent-404': 'true' }
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }
};