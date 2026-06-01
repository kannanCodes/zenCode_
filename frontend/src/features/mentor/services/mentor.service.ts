import api from "../../../shared/lib/axios";

interface ActivateMentorData {
     token: string;
     password: string;
     confirmPassword: string;
}

interface LoginResponse {
     success: boolean;
     message: string;
     data: {
          accessToken: string;
     };
}

export const mentorService = {
     activate: async (data: ActivateMentorData) => {
          const response = await api.post('/mentor/auth/activate', data);
          return response.data;
     },

     validateActivationToken: async (token: string): Promise<boolean> => {
          const response = await api.get(`/mentor/auth/activate/validate?token=${token}`);
          return response.data.data.valid;
     },

     login: async (data: { email: string; password: string }): Promise<LoginResponse['data']> => {
          const response = await api.post<LoginResponse>('/mentor/auth/login', data);
          return response.data.data;
     },

     forgotPassword: async (data: { email: string }) => {
          const response = await api.post('/mentor/auth/forgot-password', data);
          return response.data;
     },

     resetPassword: async (data: any) => {
          const response = await api.post('/mentor/auth/reset-password', data);
          return response.data;
     },

     validateResetToken: async (token: string): Promise<boolean> => {
          const response = await api.get(`/mentor/auth/reset-password/validate?token=${token}`);
          return response.data.data.valid;
     },
};
