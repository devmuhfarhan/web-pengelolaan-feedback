import { create } from 'zustand';
import api from '@/lib/axios';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (username, password) => {
    const res = await api.post('/users/login/', { username, password });
    if (res.data) {
      await useAuthStore.getState().fetchUser();
    }
  },
  logout: async () => {
    await api.post('/users/logout/');
    set({ user: null, isAuthenticated: false });
  },
  fetchUser: async () => {
    try {
      const res = await api.get('/users/me/');
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));

export default useAuthStore;
