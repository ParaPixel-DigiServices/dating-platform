import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;
  onboardingStatus:
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | null;
  error: string | null;
  onboardingCompleted: boolean;
  googleFirebaseToken: string | null;

  // Actions
  setUser: (user: User | null) => void;
  updateAuthUser: (partial: Partial<User>) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setGoogleFirebaseToken: (token: string | null) => void;
  setBootstrapping: (value: boolean) => void;
  setOnboardingStatus: (
    status:
      | "NOT_STARTED"
      | "IN_PROGRESS"
      | "COMPLETED"
      | null,
  ) => void;
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
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      onboardingCompleted: false,
      googleFirebaseToken: null,
      onboardingStatus: null,
      isBootstrapping: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      updateAuthUser: (partial) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...partial } });
        }
      },
      setAccessToken: (token) => set({ accessToken: token }),
      setRefreshToken: (token) =>set({ refreshToken: token }),
      setGoogleFirebaseToken: (token) => set({googleFirebaseToken: token}),
      setLoading: (loading) => set({ isLoading: loading }),
      setOnboardingStatus: (status) => set({ onboardingStatus: status }),
      setError: (error) => set({ error }),
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
      setBootstrapping: (value) => set({ isBootstrapping: value }),
      logout: () => set({
        user: null,
        accessToken: null,
        refreshToken: null,
        googleFirebaseToken: null,
        isAuthenticated: false,
        onboardingCompleted: false,
        onboardingStatus: null,  // Reset so stale status never drives routing after logout
        error: null,
      }),
    }),
    {
      name: 'auth-storage-v2',  // Bumped from v1 to flush stale data (isBootstrapping, old onboardingStatus)
      storage: createJSONStorage(() => AsyncStorage),
      // isBootstrapping must NOT be persisted — it must always start as `true`
      // on every app launch so the router waits for getCurrentUser() to resolve
      // before navigating.
      partialize: (state) => {
        const { isBootstrapping, ...rest } = state;
        return rest;
      },
    }
  )
);
