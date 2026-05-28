// ─── KPI Stats ────────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalUsers: number;
  totalMentors: number;
  totalCandidates: number;

  activeSubscriptions: number;
  monthlySubscriptions: number;
  yearlySubscriptions: number;

  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  avgRevenuePerUser: number;

  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  activeSessions: number;

  totalProblems: number;
  premiumProblems: number;
  submissionsToday: number;
  acceptanceRate: number;
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export type ActivityEventType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'session_started'
  | 'session_ended'
  | 'subscription_activated'
  | 'subscription_cancelled'
  | 'mentor_registered'
  | 'user_registered';

export interface AdminDashboardActivity {
  id: string;
  type: ActivityEventType;
  description: string;
  actorName: string;
  timestamp: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface DailyDataPoint {
  date: string;
  value: number;
}

export interface AdminDashboardAnalytics {
  userGrowth: DailyDataPoint[];
  revenueByDay: DailyDataPoint[];
  sessionsByDay: DailyDataPoint[];
}

// ─── Pending Actions ──────────────────────────────────────────────────────────

export interface AdminPendingActions {
  blockedUsersCount: number;
  disabledMentorsCount: number;
  failedSubscriptionsCount: number;
  pendingInvitedMentorsCount: number;
}
