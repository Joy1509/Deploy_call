import { create } from 'zustand';
import { categoryService } from '../services/categoryService';
import toast from 'react-hot-toast';

const useCategoryStore = create((set, get) => ({
  categories: [],
  
  // WebSocket event handlers
  handleCategoryCreated: (category) => {
    set(state => ({
      categories: [...state.categories.filter(c => c.id !== category.id), category]
        .sort((a, b) => a.name.localeCompare(b.name))
    }));
  },
  
  handleCategoryUpdated: (category) => {
    set(state => ({
      categories: state.categories.map(c => c.id === category.id ? category : c)
        .sort((a, b) => a.name.localeCompare(b.name))
    }));
  },
  
  handleCategoryDeleted: (deletedCategory) => {
    set(state => ({
      categories: state.categories.filter(c => c.id !== deletedCategory.id)
    }));
  },
  
  fetchCategories: async () => {
    const { categories } = get();
    // Only fetch if categories are not already loaded
    if (categories.length > 0) {
      return categories;
    }
    
    try {
      const categoriesData = await categoryService.getCategories();
      set({ categories: categoriesData });
      return categoriesData;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  },
  
  addCategory: async (name) => {
    try {
      const category = await categoryService.createCategory(name);
      toast.success('Category added successfully');
      return category;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to add category';
      toast.error(message);
      throw error;
    }
  },
  
  updateCategory: async (id, name) => {
    try {
      const category = await categoryService.updateCategory(id, name);
      toast.success('Category updated successfully');
      return category;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update category';
      toast.error(message);
      throw error;
    }
  },
  
  deleteCategory: async (id) => {
    try {
      await categoryService.deleteCategory(id);
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error('Failed to delete category');
      throw error;
    }
  }
}));

export default useCategoryStore;
