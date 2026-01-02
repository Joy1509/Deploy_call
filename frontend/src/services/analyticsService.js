import apiClient from '../api/apiClient';

export const analyticsService = {
  getEngineerAnalytics: async (days = 'all') => {
    const response = await apiClient.get(`/analytics/engineers?days=${days}`);
    return response.data;
  }
};