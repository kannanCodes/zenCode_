import api from '../../../shared/lib/axios';
import type {
  AdminDashboardStats,
  AdminDashboardActivity,
  AdminDashboardAnalytics,
  AdminPendingActions,
} from '../types/dashboard';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const adminDashboardApi = {
  fetchStats: async (): Promise<AdminDashboardStats> => {
    const res = await api.get<ApiResponse<AdminDashboardStats>>('/admin/dashboard/stats');
    return res.data.data;
  },

  fetchActivity: async (limit = 20): Promise<AdminDashboardActivity[]> => {
    const res = await api.get<ApiResponse<AdminDashboardActivity[]>>('/admin/dashboard/activity', {
      params: { limit },
    });
    return res.data.data;
  },

  fetchAnalytics: async (): Promise<AdminDashboardAnalytics> => {
    const res = await api.get<ApiResponse<AdminDashboardAnalytics>>('/admin/dashboard/analytics');
    return res.data.data;
  },

  fetchPendingActions: async (): Promise<AdminPendingActions> => {
    const res = await api.get<ApiResponse<AdminPendingActions>>('/admin/dashboard/pending-actions');
    return res.data.data;
  },
};
