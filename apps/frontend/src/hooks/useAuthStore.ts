import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { socketService } from '../services/socketService';

export type OnboardingStep = 'PHONE_VERIFIED' | 'DETAILS_DONE' | 'CATEGORY_DONE';

export interface User {
  id: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  photoURL: string | null;
  onboardingStep: OnboardingStep;
  category?: string | null;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;
  onboardingStep: OnboardingStep | null;
  error: string | null;
  googleFirebaseToken: string | null;

  // Actions
  setUser: (user: User | null) => void;
  updateAuthUser: (partial: Partial<User>) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setGoogleFirebaseToken: (token: string | null) => void;
  setBootstrapping: (value: boolean) => void;
  setOnboardingStep: (step: OnboardingStep | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      googleFirebaseToken: null,
      onboardingStep: null,
      isBootstrapping: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      updateAuthUser: (partial) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...partial } });
        }
      },
      setAccessToken: (token) => set({ accessToken: token }),
      setRefreshToken: (token) => set({ refreshToken: token }),
      setGoogleFirebaseToken: (token) => set({ googleFirebaseToken: token }),
      setLoading: (loading) => set({ isLoading: loading }),
      setOnboardingStep: (step) => {
        const currentUser = get().user;
        set({
          onboardingStep: step,
          user: currentUser ? { ...currentUser, onboardingStep: step! } : null
        });
      },
      setError: (error) => set({ error }),
      setBootstrapping: (value) => set({ isBootstrapping: value }),
      logout: () => {
        socketService.disconnect();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          googleFirebaseToken: null,
          isAuthenticated: false,
          onboardingStep: null,  // Reset so stale status never drives routing after logout
          error: null,
        });
      },
    }),
    {
      name: 'auth-storage-v3',
      storage: createJSONStorage(() => AsyncStorage),
      // isBootstrapping must NOT be persisted — it must always start as `true`
      // on every app launch so the router waits for getCurrentUser() to resolve
      // before navigating.
      partialize: (state) => {
        const { isBootstrapping, isLoading, ...rest } = state;
        return rest;
      },
    }
  )
);
