import { create } from 'zustand';

interface AppState {
  // User authentication state
  isAuthenticated: boolean;
  user: {
    id: string;
    username: string;
  } | null;
  
  // App loading state
  isLoading: boolean;
  
  // Actions
  setAuthenticated: (isAuthenticated: boolean) => void;
  setUser: (user: { id: string; username: string } | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  isAuthenticated: false,
  user: null,
  isLoading: false,
  
  // Actions
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));
