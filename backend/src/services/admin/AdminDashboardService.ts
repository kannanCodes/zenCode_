import { IAdminDashboardService } from '../../interfaces/service-interfaces/admin/IAdminDashboardService';
import { IAdminDashboardRepository } from '../../interfaces/repository-interfaces/admin/IAdminDashboardRepository';
import {
  AdminDashboardStatsDto,
  AdminDashboardActivityDto,
  AdminDashboardAnalyticsDto,
  AdminPendingActionsDto,
} from '../../dtos/admin/admin-dashboard.dto';
import { logger } from '../../shared/utils/Logger';

export class AdminDashboardService implements IAdminDashboardService {
  constructor(
    private readonly _dashboardRepository: IAdminDashboardRepository,
  ) {}

  async getStats(): Promise<AdminDashboardStatsDto> {
    try {
      return await this._dashboardRepository.getStats();
    } catch (error) {
      logger.error('AdminDashboardService.getStats failed:', error);
      throw error;
    }
  }

  async getActivityFeed(limit = 20): Promise<AdminDashboardActivityDto[]> {
    try {
      return await this._dashboardRepository.getActivityFeed(limit);
    } catch (error) {
      logger.error('AdminDashboardService.getActivityFeed failed:', error);
      throw error;
    }
  }

  async getAnalytics(): Promise<AdminDashboardAnalyticsDto> {
    try {
      return await this._dashboardRepository.getAnalytics();
    } catch (error) {
      logger.error('AdminDashboardService.getAnalytics failed:', error);
      throw error;
    }
  }

  async getPendingActions(): Promise<AdminPendingActionsDto> {
    try {
      return await this._dashboardRepository.getPendingActions();
    } catch (error) {
      logger.error('AdminDashboardService.getPendingActions failed:', error);
      throw error;
    }
  }
}
