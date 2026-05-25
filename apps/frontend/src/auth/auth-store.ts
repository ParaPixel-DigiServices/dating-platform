import { create } from "zustand";

type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  loading: boolean;

  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  loading: false,

  setUser: (user) =>
    set({
      user,
    }),

  setAccessToken: (token) =>
    set({
      accessToken: token,
    }),

  setLoading: (loading) =>
    set({
      loading,
    }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
      loading: false,
    }),
}));
