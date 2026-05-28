import { IAdminRevenueService } from '../../interfaces/service-interfaces/admin/IAdminRevenueService';
import { IAdminRevenueRepository } from '../../interfaces/repository-interfaces/admin/IAdminRevenueRepository';
import {
  RevenueMetricsDto,
  RevenueTrendPointDto,
  PlanPerformanceDto,
  PaginatedPaymentsDto,
} from '../../dtos/admin/admin-revenue.dto';

export class AdminRevenueService implements IAdminRevenueService {
  constructor(private readonly _revenueRepo: IAdminRevenueRepository) {}

  async getMetrics(): Promise<RevenueMetricsDto> {
    return this._revenueRepo.getMetrics();
  }

  async getTrend(days: number): Promise<RevenueTrendPointDto[]> {
    return this._revenueRepo.getTrend(days);
  }

  async getPlanPerformance(): Promise<PlanPerformanceDto[]> {
    return this._revenueRepo.getPlanPerformance();
  }

  async getRecentPayments(page: number, limit: number): Promise<PaginatedPaymentsDto> {
    return this._revenueRepo.getRecentPayments(page, limit);
  }
}
