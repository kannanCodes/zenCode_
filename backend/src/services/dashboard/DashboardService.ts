import User from '../../infrastructure/database/models/user.model';
import { DashboardRepository, HeatmapDay, RecentSubmission } from '../../repositories/dashboard/DashboardRepository';

export interface DashboardResponse {
  streak: {
    current: number;
    best: number;
  };
  heatmap: HeatmapDay[];
  recentSubmissions: RecentSubmission[];
}

export class DashboardService {
  constructor(private readonly dashboardRepo: DashboardRepository) {}

  async getDashboard(userId: string): Promise<DashboardResponse> {
    const [user, heatmap, recentSubmissions] = await Promise.all([
      User.findById(userId).select('streakCount bestStreak').lean(),
      this.dashboardRepo.getHeatmapData(userId),
      this.dashboardRepo.getRecentSubmissions(userId, 5),
    ]);

    return {
      streak: {
        current: user?.streakCount ?? 0,
        best: user?.bestStreak ?? 0,
      },
      heatmap,
      recentSubmissions,
    };
  }
}
