import {
  AdminDashboardStatsDto,
  AdminDashboardActivityDto,
  AdminDashboardAnalyticsDto,
  AdminPendingActionsDto,
} from '../../../dtos/admin/admin-dashboard.dto';

export interface IAdminDashboardService {
  getStats(): Promise<AdminDashboardStatsDto>;
  getActivityFeed(limit?: number): Promise<AdminDashboardActivityDto[]>;
  getAnalytics(): Promise<AdminDashboardAnalyticsDto>;
  getPendingActions(): Promise<AdminPendingActionsDto>;
}
