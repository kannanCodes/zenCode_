import api from "../../../shared/lib/axios";
import type { RegistrationRequest, VerifyOTPRequest } from "../types/auth.types";

interface LoginResponse {
     success: boolean;
     message: string;
     data: {
          accessToken: string;
     };
}

export const authService = {

     register: async (data: RegistrationRequest) => {
          const response = await api.post('/auth/register', data);
          return response.data;
     },

     verifyOTP: async (data: VerifyOTPRequest) => {
          const response = await api.post('/auth/verify-otp', data);
          return response.data;
     },

     resendOTP: async (email: string) => {
          const response = await api.post('/auth/resend-otp', { email });
          return response.data;
     },

     login: async (data: { email: string; password: string }): Promise<LoginResponse['data']> => {
          const response = await api.post<LoginResponse>('/auth/login', data);
          return response.data.data;
     },
     googleLogin: async (idToken: string) => {
          const response = await api.post('/auth/google', { idToken });
          return response.data.data;
     },
     forgotPassword: async (email: string) => {
          const response = await api.post('/auth/forgot-password', { email });
          return response.data;
     },

     validateResetToken: async (token: string): Promise<boolean> => {
          const response = await api.get(`/auth/reset-password/validate?token=${token}`);
          return response.data.data.valid;
     },

     resetPassword: async (token: string, newPassword: string, confirmPassword: string) => {
          const response = await api.post('/auth/reset-password', {
               token,
               newPassword,
               confirmPassword,
          });
          return response.data;
     },
};