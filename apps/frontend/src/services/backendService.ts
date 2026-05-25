import { create } from 'axios';

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_ENV === 'prod'
    ? process.env.EXPO_PUBLIC_BACKEND_PROD_URL
    : process.env.EXPO_PUBLIC_BACKEND_TEST_URL;

// Create axios instance with default config
const apiClient = create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Firebase ID token to requests
apiClient.interceptors.request.use(async (config) => {
  try {
    // Lazy load Firebase token getter
    const { getFirebaseIdToken } = await import('./firebaseAuthService');
    const token = await getFirebaseIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Failed to get Firebase token:', error);
  }
  return config;
});

/**
 * Send onboarding data to backend
 * Backend will create the user in the database
 */
export const submitOnboardingData = async (data: {
  firebaseUid: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  category: 'love' | 'marriage' | 'casual';
}) => {
  try {
    const response = await apiClient.post('/user/onboarding/', {
      firebaseUid: data.firebaseUid,
      email: data.email,
      phoneNumber: data.phoneNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      lookingFor: data.category,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      data: response.data,
      appToken: response.data.appToken || null,
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(`Onboarding Failed: ${errorMessage}`);
  }
};

/**
 * Get user profile from backend
 */
export const getUserProfile = async (firebaseUid: string) => {
  try {
    const response = await apiClient.get(`/user/${firebaseUid}`);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(`Get Profile Failed: ${errorMessage}`);
  }
};

export default apiClient;
