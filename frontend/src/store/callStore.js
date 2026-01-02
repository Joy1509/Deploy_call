import { create } from 'zustand';
import { callService } from '../services/callService';
import { customerService } from '../services/customerService';
import toast from 'react-hot-toast';

const useCallStore = create((set, get) => ({
  calls: [],
  customers: [],
  
  // WebSocket event handlers
  handleCallCreated: (call) => {
    set(state => ({
      calls: [call, ...state.calls.filter(c => c.id !== call.id)]
    }));
  },
  
  handleCallUpdate: (call) => {
    set(state => ({
      calls: state.calls.map(c => c.id === call.id ? call : c)
    }));
  },
  
  handleCallUpdated: (call) => get().handleCallUpdate(call),
  handleCallAssigned: (call) => get().handleCallUpdate(call),
  handleCallCompleted: (call) => get().handleCallUpdate(call),
  
  addCall: async (callData) => {
    try {
      const call = await callService.createCall(callData);
      toast.success('Call added successfully');
      return call;
    } catch (error) {
      toast.error('Failed to add call. Please try again.');
      throw error;
    }
  },

  fetchCalls: async () => {
    try {
      const calls = await callService.getCalls();
      set({ calls });
    } catch (error) {
      console.error('Failed to fetch calls:', error);
      toast.error('Failed to fetch calls');
    }
  },

  updateCall: async (callId, updates) => {
    try {
      const call = await callService.updateCall(callId, updates);
      toast.success('Call updated successfully');
      return call;
    } catch (error) {
      toast.error('Failed to update call');
      throw error;
    }
  },

  fetchCustomers: async () => {
    try {
      const customers = await customerService.getCustomers();
      set({ customers });
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to fetch customers');
    }
  },

  findCustomerByPhone: async (phone) => {
    if (!phone) return null;
    return await customerService.getCustomerByPhone(phone);
  },

  assignCall: async (callId, assignee, engineerRemark) => {
    try {
      const call = await callService.assignCall(callId, assignee, engineerRemark);
      toast.success('Call assigned successfully');
      return call;
    } catch (error) {
      toast.error('Failed to assign call');
      throw error;
    }
  },

  completeCall: async (callId, remark) => {
    try {
      const call = await callService.completeCall(callId, remark);
      toast.success('Call completed successfully');
      return call;
    } catch (error) {
      toast.error('Failed to complete call');
      throw error;
    }
  }
}));

export default useCallStore;