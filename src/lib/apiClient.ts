// src/lib/apiClient.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: SUPABASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
  },
});

// Request interceptor - Add auth headers to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add Supabase anon key to headers
    if (config.headers) {
      config.headers['apikey'] = SUPABASE_ANON_KEY;
      config.headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 401:
          console.error('Unauthorized - Check your API key');
          break;
        case 403:
          console.error('Forbidden - Access denied');
          break;
        case 404:
          console.error('Not Found - Resource not found');
          break;
        case 500:
          console.error('Server Error - Internal server error');
          break;
        default:
          console.error(`API Error: ${status}`, data?.message || error.message);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error - No response from server');
    } else {
      // Error setting up the request
      console.error('Request Error:', error.message);
    }

    return Promise.reject(error);
  },
);

// Export typed API methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config),
};

export default apiClient;

