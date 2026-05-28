// ─── KPI Stats ────────────────────────────────────────────────────────────────

export interface AdminDashboardStatsDto {
  // Users
  totalUsers: number;
  totalMentors: number;
  totalCandidates: number;

  // Subscriptions
  activeSubscriptions: number;
  monthlySubscriptions: number;
  yearlySubscriptions: number;

  // Revenue (derived from Plan.price × subscriptions)
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  avgRevenuePerUser: number;

  // Sessions (MentorSession)
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  activeSessions: number;

  // Problems / Coding platform
  totalProblems: number;
  premiumProblems: number;
  submissionsToday: number;
  acceptanceRate: number; // percentage 0-100
}

// ─── Activity Feed ─────────────────────────────────────────────────────────────

export type ActivityEventType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'session_started'
  | 'session_ended'
  | 'subscription_activated'
  | 'subscription_cancelled'
  | 'mentor_registered'
  | 'user_registered';

export interface AdminDashboardActivityDto {
  id: string;
  type: ActivityEventType;
  description: string;
  actorName: string;
  timestamp: string; // ISO string
}

// ─── Analytics (30-day trend) ─────────────────────────────────────────────────

export interface DailyDataPoint {
  date: string; // 'YYYY-MM-DD'
  value: number;
}

export interface AdminDashboardAnalyticsDto {
  userGrowth: DailyDataPoint[];    // daily new registrations (30d)
  revenueByDay: DailyDataPoint[];  // daily revenue (30d)
  sessionsByDay: DailyDataPoint[]; // daily sessions count (30d)
}

// ─── Pending Actions ──────────────────────────────────────────────────────────

export interface AdminPendingActionsDto {
  blockedUsersCount: number;
  disabledMentorsCount: number;
  failedSubscriptionsCount: number; // past_due | unpaid
  pendingInvitedMentorsCount: number;
}
