import { create } from 'zustand';
import { carryInService } from '../services/carryInService';
import toast from 'react-hot-toast';

const useCarryInServiceStore = create((set, get) => ({
  services: [],
  loading: false,

  // WebSocket event handlers
  handleServiceCreated: (service) => {
    set(state => ({
      services: [service, ...state.services.filter(s => s.id !== service.id)]
    }));
  },
  
  handleServiceUpdated: (service) => {
    set(state => ({
      services: state.services.map(s => s.id === service.id ? service : s)
    }));
  },

  fetchServices: async () => {
    set({ loading: true });
    try {
      const services = await carryInService.getCarryInServices();
      set({ services, loading: false });
    } catch (error) {
      toast.error('Failed to fetch services');
      set({ loading: false });
    }
  },

  addService: async (serviceData) => {
    try {
      const service = await carryInService.createCarryInService(serviceData);
      toast.success('Service added successfully');
      return service;
    } catch (error) {
      toast.error('Failed to add service');
      throw error;
    }
  },

  completeService: async (serviceId, completeRemark) => {
    try {
      const service = await carryInService.completeCarryInService(serviceId, completeRemark);
      toast.success('Service marked as completed');
      return service;
    } catch (error) {
      toast.error('Failed to complete service');
      throw error;
    }
  },

  deliverService: async (serviceId, deliverRemark) => {
    try {
      const service = await carryInService.deliverCarryInService(serviceId, deliverRemark);
      toast.success('Service delivered to customer');
      return service;
    } catch (error) {
      toast.error('Failed to deliver service');
      throw error;
    }
  },

  findCustomerByPhone: async (phone) => {
    return await carryInService.getCarryInCustomerByPhone(phone);
  }
}));

export default useCarryInServiceStore;