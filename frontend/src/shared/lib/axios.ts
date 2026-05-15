import axios from 'axios';
import { tokenService } from './token';
import { showError } from '../utils/toast.util';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
     baseURL: API_URL,
     headers: {
          'Content-Type': 'application/json',
     },
     withCredentials: true,
});

// Request Interceptor - Add token to headers
api.interceptors.request.use((config) => {
     const token = tokenService.getAccessToken();
     if (token) {
          config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
});

// Response Interceptor - Handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
     resolve: (token: string) => void;
     reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
     failedQueue.forEach((promise) => {
          if (error) {
               promise.reject(error);
          } else {
               promise.resolve(token!);
          }
     });
     failedQueue = [];
};

api.interceptors.response.use(
     (response) => response,
     async (error) => {
          const originalRequest = error.config;

          // Network error
          if (!error.response) {
               showError('Network error. Please check your connection.');
               return Promise.reject(error);
          }

          // Don't refresh token for auth endpoints
          const isAuthEndpoint =
               originalRequest.url?.includes('/auth/login') ||
               originalRequest.url?.includes('/auth/register') ||
               originalRequest.url?.includes('/auth/verify-otp') ||
                originalRequest.url?.includes('/auth/resend-otp') ||
                originalRequest.url?.includes('/auth/refresh') ||
                originalRequest.url?.includes('/auth/logout');

          const requestUrl: string = originalRequest.url || '';
          const isAdminRequest = requestUrl.startsWith('/admin/');
          const isMentorRequest = requestUrl.startsWith('/mentor/');
          const refreshUrl = isAdminRequest
               ? '/admin/auth/refresh'
               : isMentorRequest
                    ? '/mentor/auth/refresh'
                    : '/auth/refresh';

          // Handle 401 (Unauthorized) - Token expired
          if (error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
               // If already refreshing, queue this request
               if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                         failedQueue.push({ resolve, reject });
                    })
                         .then((token) => {
                              originalRequest.headers.Authorization = `Bearer ${token}`;
                              return api(originalRequest);
                         })
                         .catch((err) => Promise.reject(err));
               }

               originalRequest._retry = true;
               isRefreshing = true;

               try {
                    const response = await api.post(
                         refreshUrl,
                         {},
                         { withCredentials: true }
                    );
                    const newAccessToken = response.data.data.accessToken;

                    // Update token
                    tokenService.setAccessToken(newAccessToken);

                    // Retry all queued requests
                    processQueue(null, newAccessToken);

                    // Retry original request
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
               } catch (refreshError) {
                    // Refresh failed - logout user
                    processQueue(refreshError, null);
                    tokenService.clear();

                    showError('Session expired. Please login again.');
                    window.location.href = isAdminRequest
                         ? '/admin/login'
                         : isMentorRequest
                              ? '/mentor/login'
                              : '/login';

                    return Promise.reject(refreshError);
               } finally {
                    isRefreshing = false;
               }
          }

          // Only show toast for server errors (5xx) or network issues
          // Let components handle 4xx errors (validation, unauthorized, etc.)
          if (error.response.status >= 500) {
               showError('Server error. Please try again later.');
          }

          return Promise.reject(error);
     }
);

export default api;