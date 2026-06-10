import apiClient from "./backendService";

export const getCurrentUser = async() => {
    const response = await apiClient.get('/auth/me');
    return response.data;
}