import { create } from 'axios';
import { useAuthStore } from '@/hooks/useAuthStore';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_TEST_URL;

console.log("BACKEND_URL", BACKEND_URL);
// const BACKEND_URL =
//   process.env.EXPO_PUBLIC_BACKEND_ENV === 'prod'
//     ? process.env.EXPO_PUBLIC_BACKEND_PROD_URL
//     : process.env.EXPO_PUBLIC_BACKEND_TEST_URL;

// Create axios instance with default config
const apiClient = create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add access token to authenticated requests
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Handle Firebase Login (Sign up / Login)
 * Uses both Google and optionally Phone Firebase tokens.
 */
export const firebaseLogin = async (
  googleIdToken: string,
  phoneIdToken?: string,
) => {
  try {
    console.log("firebase login token recieved");
    // Generate device info if available
    const deviceId = Device.osBuildId || 'unknown-device';
    const platform = Platform.OS === 'ios' ? 'IOS' : Platform.OS === 'android' ? 'ANDROID' : 'WEB';
    const deviceName = Device.modelName || undefined;

    console.log("firebase login token deviceName", deviceName);

    const response = await apiClient.post('/auth/firebase-login', {
      googleIdToken,
      ...(phoneIdToken ? { phoneIdToken } : {}),
      deviceId,
      platform,
      deviceName,
    });

    console.log("response", response);

    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(`Firebase Login Failed: ${errorMessage}`);
  }
};

/**
 * Fetch current user session and onboarding state
 */
export const getMe = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(`Get Profile Failed: ${errorMessage}`);
  }
};

/**
 * Logout and revoke session on the backend
 */
export const logout = async () => {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(`Logout Failed: ${errorMessage}`);
  }
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(`Token Refresh Failed: ${errorMessage}`);
  }
};

/**
 * Save user basic details (Name, DOB, Gender)
 */
export const saveOnboardingDetails = async (data: {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'NON-BINARY';
}) => {
  try {
    const response = await apiClient.post('/onboarding/details', data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(`Save Details Failed: ${errorMessage}`);
  }
};

/**
 * Save user category preference (Love / Marriage)
 */
export const saveOnboardingCategory = async (data: {
  category: 'LOVE' | 'MARRIAGE';
  subCategory?: string;
}) => {
  try {
    const response = await apiClient.post('/onboarding/category', data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(`Save Category Failed: ${errorMessage}`);
  }
};

export default apiClient;
