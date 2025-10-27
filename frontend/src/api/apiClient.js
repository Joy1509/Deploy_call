import axios from 'axios';
import useAuthStore from '../store/authStore';

// Use Vite environment variable for the API base URL when available.
// During development this can be set in a local .env file, and in
// production we recommend setting VITE_API_URL in the deployment env.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://call-management-1gct.onrender.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;