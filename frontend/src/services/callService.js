import apiClient from '../api/apiClient';

export const callService = {
  getCalls: async () => {
    const response = await apiClient.get('/calls');
    return response.data;
  },

  createCall: async (callData) => {
    const response = await apiClient.post('/calls', callData);
    return response.data;
  },

  updateCall: async (callId, updates) => {
    const response = await apiClient.put(`/calls/${callId}`, updates);
    return response.data;
  },

  assignCall: async (callId, assignee, engineerRemark) => {
    const response = await apiClient.post(`/calls/${callId}/assign`, {
      assignee,
      engineerRemark
    });
    return response.data;
  },

  completeCall: async (callId, remark) => {
    const response = await apiClient.post(`/calls/${callId}/complete`, {
      remark
    });
    return response.data;
  },

  checkDuplicate: async (phone, category) => {
    const response = await apiClient.post('/calls/check-duplicate', { phone, category });
    return response.data;
  },

  incrementCallCount: async (callId) => {
    const response = await apiClient.put(`/calls/${callId}/increment`);
    return response.data;
  }
};