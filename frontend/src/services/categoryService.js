import apiClient from '../api/apiClient';

export const categoryService = {
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  createCategory: async (name) => {
    const response = await apiClient.post('/categories', { name });
    return response.data;
  },

  updateCategory: async (categoryId, name) => {
    const response = await apiClient.put(`/categories/${categoryId}`, { name });
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await apiClient.delete(`/categories/${categoryId}`);
    return response.data;
  },

  getServiceCategories: async () => {
    const response = await apiClient.get('/service-categories');
    return response.data;
  },

  createServiceCategory: async (name) => {
    const response = await apiClient.post('/service-categories', { name });
    return response.data;
  },

  updateServiceCategory: async (categoryId, name) => {
    const response = await apiClient.put(`/service-categories/${categoryId}`, { name });
    return response.data;
  },

  deleteServiceCategory: async (categoryId) => {
    const response = await apiClient.delete(`/service-categories/${categoryId}`);
    return response.data;
  }
};