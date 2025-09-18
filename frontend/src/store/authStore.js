import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      users: [],
      
      login: async (username, password) => {
        // Mock login for testing
        if (username && password) {
          const mockUser = {
            id: 1,
            username: username,
            role: username === 'host' ? 'HOST' : username === 'admin' ? 'ADMIN' : 'USER',
            createdAt: new Date().toISOString()
          };
          const mockToken = 'mock-token-' + Date.now();
          set({ user: mockUser, token: mockToken });
          toast.success(`Welcome back, ${username}!`);
          return true;
        }
        toast.error('Please enter username and password');
        return false;
      },
      
      logout: () => {
        set({ user: null, token: null });
        toast.success('Logged out successfully');
      },
      
      fetchUsers: async () => {
        // Mock users data
        const mockUsers = [
          { id: 1, username: 'host', role: 'HOST', createdAt: new Date().toISOString() },
          { id: 2, username: 'admin', role: 'ADMIN', createdAt: new Date().toISOString() },
          { id: 3, username: 'worker1', role: 'USER', createdAt: new Date().toISOString() },
          { id: 4, username: 'worker2', role: 'USER', createdAt: new Date().toISOString() }
        ];
        set({ users: mockUsers });
      },

      createUser: async (userData) => {
        const newUser = {
          id: Date.now(),
          ...userData,
          createdAt: new Date().toISOString()
        };
        set(state => ({ users: [...state.users, newUser] }));
        toast.success('User created successfully');
        return newUser;
      },

      updateUserRole: async (userId, newRole) => {
        set(state => ({
          users: state.users.map(u => 
            u.id === userId ? { ...u, role: newRole } : u
          )
        }));
        toast.success('User role updated successfully');
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;