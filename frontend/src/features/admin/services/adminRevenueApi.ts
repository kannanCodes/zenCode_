import api from '../../../shared/lib/axios';
import type { 
  RevenueMetricsDto, 
  RevenueTrendPointDto, 
  PlanPerformanceDto, 
  PaginatedPaymentsDto 
} from '../types/revenue';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const adminRevenueApi = {
  getMetrics: async (): Promise<RevenueMetricsDto> => {
    const res = await api.get<ApiResponse<RevenueMetricsDto>>('/admin/revenue/metrics');
    return res.data.data;
  },

  getTrend: async (days: number = 30): Promise<RevenueTrendPointDto[]> => {
    const res = await api.get<ApiResponse<RevenueTrendPointDto[]>>(`/admin/revenue/trend?days=${days}`);
    return res.data.data;
  },

  getPlanPerformance: async (): Promise<PlanPerformanceDto[]> => {
    const res = await api.get<ApiResponse<PlanPerformanceDto[]>>('/admin/revenue/plan-performance');
    return res.data.data;
  },

  getRecentPayments: async (page: number = 1, limit: number = 10): Promise<PaginatedPaymentsDto> => {
    const res = await api.get<ApiResponse<PaginatedPaymentsDto>>(`/admin/revenue/recent-payments?page=${page}&limit=${limit}`);
    return res.data.data;
  }
};
