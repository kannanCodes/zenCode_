import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import KpiCards from '../components/dashboard/KpiCards';
import RevenueChart from '../components/dashboard/RevenueChart';
import UserGrowthChart from '../components/dashboard/UserGrowthChart';
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed';
import PendingActionsPanel from '../components/dashboard/PendingActionsPanel';
import SessionAnalyticsCard from '../components/dashboard/SessionAnalyticsCard';
import PlatformHealthCard from '../components/dashboard/PlatformHealthCard';
import QuickActions from '../components/dashboard/QuickActions';
import { adminDashboardApi } from '../services/adminDashboardApi';
import { tokenService } from '../../../shared/lib/token';
import type {
  AdminDashboardStats,
  AdminDashboardActivity,
  AdminDashboardAnalytics,
  AdminPendingActions,
} from '../types/dashboard';

// ─── Per-widget loading / error state ────────────────────────────────────────
interface WidgetState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

function initWidget<T>(): WidgetState<T> {
  return { data: null, isLoading: true, error: null };
}

// ─── Page ────────────────────────────────────────────────────────────────────
const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<WidgetState<AdminDashboardStats>>(initWidget());
  const [activity, setActivity] = useState<WidgetState<AdminDashboardActivity[]>>(initWidget());
  const [analytics, setAnalytics] = useState<WidgetState<AdminDashboardAnalytics>>(initWidget());
  const [pendingActions, setPendingActions] = useState<WidgetState<AdminPendingActions>>(initWidget());

  const loadDashboard = useCallback(async () => {
    // Reset loading states
    setStats({ data: null, isLoading: true, error: null });
    setActivity({ data: null, isLoading: true, error: null });
    setAnalytics({ data: null, isLoading: true, error: null });
    setPendingActions({ data: null, isLoading: true, error: null });

    // Parallel fetches — each widget isolated
    const [statsResult, activityResult, analyticsResult, pendingResult] = await Promise.allSettled([
      adminDashboardApi.fetchStats(),
      adminDashboardApi.fetchActivity(20),
      adminDashboardApi.fetchAnalytics(),
      adminDashboardApi.fetchPendingActions(),
    ]);

    setStats(
      statsResult.status === 'fulfilled'
        ? { data: statsResult.value, isLoading: false, error: null }
        : { data: null, isLoading: false, error: 'Failed to load stats' }
    );

    setActivity(
      activityResult.status === 'fulfilled'
        ? { data: activityResult.value, isLoading: false, error: null }
        : { data: null, isLoading: false, error: 'Failed to load activity' }
    );

    setAnalytics(
      analyticsResult.status === 'fulfilled'
        ? { data: analyticsResult.value, isLoading: false, error: null }
        : { data: null, isLoading: false, error: 'Failed to load analytics' }
    );

    setPendingActions(
      pendingResult.status === 'fulfilled'
        ? { data: pendingResult.value, isLoading: false, error: null }
        : { data: null, isLoading: false, error: 'Failed to load pending actions' }
    );
  }, []);

  useEffect(() => {
    const token = tokenService.getAccessToken();
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }
    loadDashboard();
  }, [loadDashboard, navigate]);

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-[#0a0a0a] border-b border-[#1c1c1c] px-6 py-5 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-2xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-gray-500 text-xs font-mono mt-0.5">
                Platform control center — real-time operational visibility
              </p>
            </div>
            <button
              id="dashboard-refresh-btn"
              onClick={loadDashboard}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2d3a] text-gray-400 hover:text-white hover:border-[var(--color-primary)] text-xs font-mono transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* SECTION 1 — KPI Cards */}
          <KpiCards
            stats={stats.data}
            isLoading={stats.isLoading}
            error={stats.error}
          />

          {/* SECTION 2 — Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart
              data={analytics.data?.revenueByDay ?? []}
              isLoading={analytics.isLoading}
              error={analytics.error}
            />
            <UserGrowthChart
              data={analytics.data?.userGrowth ?? []}
              isLoading={analytics.isLoading}
              error={analytics.error}
            />
          </div>

          {/* SECTION 3 — Activity + Pending Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivityFeed
              items={activity.data ?? []}
              isLoading={activity.isLoading}
              error={activity.error}
            />
            <PendingActionsPanel
              data={pendingActions.data}
              isLoading={pendingActions.isLoading}
              error={pendingActions.error}
            />
          </div>

          {/* SECTION 4 — Session Analytics + Platform Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SessionAnalyticsCard
              data={analytics.data?.sessionsByDay ?? []}
              completedSessions={stats.data?.completedSessions ?? 0}
              cancelledSessions={stats.data?.cancelledSessions ?? 0}
              totalSessions={stats.data?.totalSessions ?? 0}
              isLoading={analytics.isLoading || stats.isLoading}
              error={analytics.error ?? stats.error}
            />
            <PlatformHealthCard
              stats={stats.data}
              isLoading={stats.isLoading}
              error={stats.error}
            />
          </div>

          {/* SECTION 5 — Quick Actions */}
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
