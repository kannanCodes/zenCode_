import {
  RevenueMetricsDto,
  RevenueTrendPointDto,
  PlanPerformanceDto,
  PaginatedPaymentsDto,
} from '../../../dtos/admin/admin-revenue.dto';

export interface IAdminRevenueRepository {
  getMetrics(): Promise<RevenueMetricsDto>;
  getTrend(days: number): Promise<RevenueTrendPointDto[]>;
  getPlanPerformance(): Promise<PlanPerformanceDto[]>;
  getRecentPayments(page: number, limit: number): Promise<PaginatedPaymentsDto>;
}
