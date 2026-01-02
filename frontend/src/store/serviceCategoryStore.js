import { create } from 'zustand';
import { categoryService } from '../services/categoryService';
import toast from 'react-hot-toast';

const useServiceCategoryStore = create((set, get) => ({
  serviceCategories: [],
  
  // WebSocket event handlers
  handleServiceCategoryCreated: (category) => {
    set(state => ({
      serviceCategories: [...state.serviceCategories.filter(c => c.id !== category.id), category]
        .sort((a, b) => a.name.localeCompare(b.name))
    }));
  },
  
  handleServiceCategoryUpdated: (category) => {
    set(state => ({
      serviceCategories: state.serviceCategories.map(c => c.id === category.id ? category : c)
        .sort((a, b) => a.name.localeCompare(b.name))
    }));
  },
  
  handleServiceCategoryDeleted: (deletedCategory) => {
    set(state => ({
      serviceCategories: state.serviceCategories.filter(c => c.id !== deletedCategory.id)
    }));
  },
  
  fetchServiceCategories: async () => {
    try {
      const serviceCategories = await categoryService.getServiceCategories();
      set({ serviceCategories });
      return serviceCategories;
    } catch (error) {
      console.error('Failed to fetch service categories:', error);
      return [];
    }
  },
  
  addServiceCategory: async (name) => {
    try {
      const category = await categoryService.createServiceCategory(name);
      toast.success('Service category added successfully');
      return category;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to add service category';
      toast.error(message);
      throw error;
    }
  },
  
  updateServiceCategory: async (id, name) => {
    try {
      const category = await categoryService.updateServiceCategory(id, name);
      toast.success('Service category updated successfully');
      return category;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update service category';
      toast.error(message);
      throw error;
    }
  },
  
  deleteServiceCategory: async (id) => {
    try {
      await categoryService.deleteServiceCategory(id);
      toast.success('Service category deleted successfully');
    } catch (error) {
      toast.error('Failed to delete service category');
      throw error;
    }
  }
}));

export default useServiceCategoryStore;
