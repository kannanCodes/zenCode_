import api from '../../../shared/lib/axios';

export interface HeatmapDay {
  date: string;
  count: number;
}

export interface RecentSubmission {
  id: string;
  problemId: string;
  problemTitle: string;
  status: string;
  language: string;
  createdAt: string;
}

export interface DashboardData {
  streak: {
    current: number;
    best: number;
  };
  heatmap: HeatmapDay[];
  recentSubmissions: RecentSubmission[];
}

export const dashboardService = {
  getDashboard: async (): Promise<DashboardData> => {
    const res = await api.get<{ data: DashboardData }>('/dashboard');
    return res.data.data;
  },
};
