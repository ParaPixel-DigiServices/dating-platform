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

  console.log("token in interceptor", token);
  console.log("INTERCEPTOR - Sending Token: ", token ? `Bearer ${token.substring(0, 10)}...` : "NO TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to unwrap the backend { success: true, data: T } format
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success && response.data.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // If the error is 401 Unauthorized and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const authStore = useAuthStore.getState();
        const refreshToken = authStore.refreshToken;
        
        if (refreshToken) {
          // Manually make the refresh call using standard axios to avoid interceptor loops
          const { create } = await import('axios');
          const refreshClient = create({ baseURL: process.env.EXPO_PUBLIC_BACKEND_TEST_URL });
          
          const refreshResponse = await refreshClient.post('/auth/refresh', { refreshToken });
          const newAccessToken = refreshResponse.data.data.accessToken;
          const newRefreshToken = refreshResponse.data.data.refreshToken;
          
          // Save the new tokens
          authStore.setAccessToken(newAccessToken);
          authStore.setRefreshToken(newRefreshToken);
          
          // Update the original request's authorization header and retry it
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If the refresh token is ALSO expired/invalid, log the user out entirely
        console.error("Refresh token failed, logging out:", refreshError);
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

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

    console.log("firebase login response from interceptor: ", JSON.stringify(response.data));

    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error(`${errorMessage}`);
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
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error(`${errorMessage}`);
  }
};

/**
 * Fetch full user profile data
 */
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/user/me');
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error(`${errorMessage}`);
  }
};

/**
 * Fetch dynamic schema fields for onboarding
 */
export const getOnboardingFields = async () => {
  try {
    const response = await apiClient.get('/user/onboarding-fields');
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error(`${errorMessage}`);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (data: Record<string, any>) => {
  try {
    const response = await apiClient.patch('/user/me', data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error(`${errorMessage}`);
  }
};

/**
 * Update user preferences
 */
export const updatePreferences = async (data: Record<string, any>) => {
  try {
    const response = await apiClient.put('/user/preferences', data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error(`${errorMessage}`);
  }
};

/**
 * Get Presigned URL
 */
export const getPresignedUrl = async (extension: string = 'jpg') => {
  try {
    const response = await apiClient.get(`/media/presigned-url?extension=${extension}`);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error(`Failed to get upload URL: ${errorMessage}`);
  }
};

/**
 * Upload Image to S3
 */
export const uploadImageToS3 = async (presignedUrl: string, imageUri: string, mimeType: string) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType,
      },
      body: blob,
    });
    
    if (!uploadRes.ok) {
      throw new Error(`S3 upload failed with status ${uploadRes.status}`);
    }
    
    return true;
  } catch (error: any) {
    throw new Error(`Failed to upload image directly to S3: ${error.message}`);
  }
};

/**
 * Save photo URL to DB
 */
export const saveProfilePhoto = async (cdnUrl: string, storageKey: string) => {
  try {
    const response = await apiClient.post('/user/photos', { cdnUrl, storageKey });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error(`Failed to save photo: ${errorMessage}`);
  }
};

/**
 * Delete photo
 */
export const deleteProfilePhoto = async (photoId: string) => {
  try {
    const response = await apiClient.delete(`/user/photos/${photoId}`);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error(`Failed to delete photo: ${errorMessage}`);
  }
};

/**
 * Reorder photos
 */
export const reorderProfilePhotos = async (photoIds: string[]) => {
  try {
    const response = await apiClient.put('/user/photos/reorder', { photoIds });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error(`Failed to reorder photos: ${errorMessage}`);
  }
};

/**
 * Set a photo as the primary profile picture
 */
export const setPrimaryProfilePhoto = async (photoId: string) => {
  try {
    const response = await apiClient.patch(`/user/photos/${photoId}/primary`);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error(`Failed to set profile picture: ${errorMessage}`);
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
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error(`${errorMessage}`);
  }
};

/**
 * Delete account permanently
 */
export const deleteAccount = async () => {
  try {
    const response = await apiClient.delete('/user/account');
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error(`Failed to delete account: ${errorMessage}`);
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
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error(`${errorMessage}`);
  }
};

/**
 * Fetch a public profile by ID
 */
export const getPublicProfile = async (id: string) => {
  try {
    const response = await apiClient.get(`/user/profile/${id}`);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error(`${errorMessage}`);
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
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error(`${errorMessage}`);
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
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error(`${errorMessage}`);
  }
};

/**
 * Get available religions
 */
export const getReligions = async () => {
  try {
    const response = await apiClient.get('/user/religions');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch religions', error);
    throw error;
  }
};

/**
 * Get available interests (optionally filtered by category e.g. 'HINDU_VALUES')
 */
export const getInterests = async (category?: string) => {
  try {
    const url = category ? `/user/interests?category=${category}` : '/user/interests';
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch interests', error);
    throw error;
  }
};

export const getSparkQuestions = async () => {
  try {
    const response = await apiClient.get('/spark/me');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch spark questions', error);
    throw error;
  }
};

export const updateSparkQuestions = async (questions: string[]) => {
  try {
    const response = await apiClient.post('/spark/me/questions', { questions });
    return response.data;
  } catch (error) {
    console.error('Failed to update spark questions', error);
    throw error;
  }
};

export const getActivity = async () => {
  try {
    const response = await apiClient.get('/interaction/me/activity');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch activity', error);
    throw error;
  }
};

export default apiClient;

// ── Social API ──────────────────────────────────────────────────────────────

export const getSocialTopics = async () => {
  const response = await apiClient.get('/social/topics');
  return response.data; // Since interceptor unwraps, this is the data array
};

export const getSocialPosts = async (topicId?: string, search?: string) => {
  const params = new URLSearchParams();
  if (topicId) params.append('topicId', topicId);
  if (search) params.append('search', search);
  
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get(`/social/posts${queryString}`);
  return response.data;
};

export const getSocialPost = async (id: string) => {
  const response = await apiClient.get(`/social/posts/${id}`);
  return response.data;
};

export const createSocialPost = async (data: { topicId: string; title: string; body: string; isAnonymous: boolean }) => {
  const response = await apiClient.post('/social/posts', data);
  return response.data;
};

export const createSocialComment = async (data: { postId: string; parentId?: string; body: string; isAnonymous: boolean }) => {
  const response = await apiClient.post('/social/comments', data);
  return response.data;
};

export const voteSocial = async (data: { targetType: 'POST' | 'COMMENT'; targetId: string; value: number }) => {
  const response = await apiClient.post('/social/vote', data);
  return response.data;
};
