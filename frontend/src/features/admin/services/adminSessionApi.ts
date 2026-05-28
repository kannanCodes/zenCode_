import api from '../../../shared/lib/axios';
import type { AdminSessionPaginatedResponse, AdminSessionDetailsDto } from '../types/session';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const adminSessionApi = {
  getSessions: async (params: { page: number; limit: number; status: string; search: string }): Promise<AdminSessionPaginatedResponse> => {
    const res = await api.get<ApiResponse<AdminSessionPaginatedResponse>>('/admin/sessions', { params });
    return res.data.data;
  },

  getSessionDetails: async (id: string): Promise<AdminSessionDetailsDto> => {
    const res = await api.get<ApiResponse<AdminSessionDetailsDto>>(`/admin/sessions/${id}`);
    return res.data.data;
  }
};
