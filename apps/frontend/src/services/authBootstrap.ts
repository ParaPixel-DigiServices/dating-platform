import apiClient from "./backendService";
import { useAuthStore } from "@/hooks/useAuthStore";

export const getCurrentUser = async () => {
  const response = await apiClient.get("/auth/me");
  return response.data;
};

export const restoreSession = async () => {
  try {
    const { accessToken, setUser, logout } = useAuthStore.getState();

    if (!accessToken) {
      logout();
      return null;
    }

    const user = await getCurrentUser();

    if (user) {
      setUser({
        id: user.id,
        email: user.email ?? null,
        phoneNumber: user.phoneNumber ?? null,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
      });
      return user;
    }

    logout();
    return null;
  } catch (error) {
    useAuthStore.getState().logout();
    return null;
  }
};