import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      users: [],
      isInitialized: false,
      
      // Initialize user data from token
      initializeAuth: async () => {
        const { token, user } = get();
        if (token && !user) {
          try {
            const userData = await authService.getMe();
            set({ user: userData, isInitialized: true });
          } catch (error) {
            // Token is invalid, clear it
            set({ token: null, user: null, isInitialized: true });
          }
        } else {
          set({ isInitialized: true });
        }
      },
      
      // WebSocket event handlers
      handleUserCreated: (user) => {
        set(state => ({
          users: [...state.users.filter(u => u.id !== user.id), user]
        }));
      },
      
      handleUserUpdated: (user) => {
        set(state => ({
          users: state.users.map(u => u.id === user.id ? user : u)
        }));
      },
      
      handleUserDeleted: (deletedUser) => {
        set(state => ({
          users: state.users.filter(u => u.id !== deletedUser.id)
        }));
      },
      
      login: async (username, password) => {
        try {
          const { token, user } = await authService.login(username, password);
          set({ user, token, isInitialized: true });
          
          // Clear localStorage rate limit data on successful login
          localStorage.removeItem('loginAttempts');
          
          toast.success(`Welcome back, ${user.username}!`);
          return true;
        } catch (err) {
          // Update localStorage with failed attempt
          const stored = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
          const now = Date.now();
          
          if (err.response?.status === 429) {
            // Server says we're rate limited
            const data = err.response.data;
            localStorage.setItem('loginAttempts', JSON.stringify({
              blocked: true,
              remainingTime: data.remainingTime,
              blockedAt: now
            }));
            toast.error('Too many failed attempts. Please wait.');
          } else {
            // Regular login failure
            localStorage.setItem('loginAttempts', JSON.stringify({
              ...stored,
              lastFailedAt: now
            }));
            toast.error('Invalid credentials');
          }
          return false;
        }
      },
      
      logout: () => {
        set({ user: null, token: null, users: [], isInitialized: true });
        toast.success('Logged out successfully');
      },
      
      fetchUsers: async () => {
        const state = get();
        if (!state.user || !['HOST', 'ADMIN'].includes(state.user.role)) {
          return;
        }
        try {
          const users = await userService.getUsers();
          set({ users });
        } catch (err) {
          if (err.response?.status === 403 || err.response?.status === 401) {
            return;
          }
          console.error('Failed to fetch users', err);
        }
      },

      createUser: async (userData) => {
        try {
          const user = await userService.createUser(userData);
          toast.success('User created successfully');
          return user;
        } catch (err) {
          toast.error('Failed to create user');
          throw err;
        }
      },

      updateUserRole: async (userId, newRole, secretPassword = null) => {
        try {
          const payload = { role: newRole };
          if (secretPassword) {
            payload.secretPassword = secretPassword;
          }
          await userService.updateUser(userId, payload);
          toast.success('User role updated successfully');
        } catch (err) {
          toast.error('Failed to update role');
          throw err;
        }
      },

      updateUser: async (userId, userData) => {
        try {
          const user = await userService.updateUser(userId, userData);
          toast.success('User updated successfully');
          return user;
        } catch (err) {
          toast.error('Failed to update user');
          throw err;
        }
      },

      deleteUser: async (userId) => {
        try {
          await userService.deleteUser(userId);
          toast.success('User deleted successfully');
        } catch (err) {
          toast.error('Failed to delete user');
          throw err;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token })
    }
  )
);

export default useAuthStore;