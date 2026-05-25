import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  onboardingCompleted: boolean;

  // Actions
  setUser: (user: User | null) => void;
  updateAuthUser: (partial: Partial<User>) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      onboardingCompleted: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      updateAuthUser: (partial) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...partial } });
        }
      },
      setAccessToken: (token) => set({ accessToken: token }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
      logout: () => set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        onboardingCompleted: false,
        error: null,
      }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
