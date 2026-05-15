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

     login: async (data: { email: string; password: string }): Promise<LoginResponse['data']> => {
          const response = await api.post<LoginResponse>('/mentor/auth/login', data);
          return response.data.data;
     },
};