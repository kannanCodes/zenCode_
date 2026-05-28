import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tokenService } from '../../../shared/lib/token';
import { mentorBookingApi } from '../services/mentorBookingApi';
import type { MentorDashboardStats, DashboardUpcomingSession } from '../types/booking';
import KpiCards from '../components/dashboard/KpiCards';
import NextSessionCountdown from '../components/dashboard/NextSessionCountdown';
import UpcomingSessionsPanel from '../components/dashboard/UpcomingSessionsPanel';
import TodayTimeline from '../components/dashboard/TodayTimeline';
import { notificationSocketManager } from '../../../shared/lib/notificationSocket';

const MentorDashboardPage = () => {
  const payload = tokenService.getTokenPayload();
  const mentorName = (payload as Record<string, string> | null)?.fullName ?? 'Mentor';

  // ── Independent widget states ────────────────────────────────────────────────
  const [stats, setStats] = useState<MentorDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [upcoming, setUpcoming] = useState<DashboardUpcomingSession[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [upcomingError, setUpcomingError] = useState<string | null>(null);

  // ── Load stats and upcoming in parallel ──────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    // Both requests fire simultaneously; each handles its own error
    const [statsRes, upcomingRes] = await Promise.allSettled([
      mentorBookingApi.getDashboardStats(),
      mentorBookingApi.getUpcomingBookings(10),
    ]);

    if (statsRes.status === 'fulfilled') {
      setStats(statsRes.value.data);
      setStatsError(null);
    } else {
      setStatsError('Could not load stats.');
    }
    setStatsLoading(false);

    if (upcomingRes.status === 'fulfilled') {
      setUpcoming(upcomingRes.value.data);
      setUpcomingError(null);
    } else {
      setUpcomingError('Could not load upcoming sessions.');
    }
    setUpcomingLoading(false);
  }, []);

  // ── Refresh upcoming sessions list (after cancel) ────────────────────────────
  const refreshUpcoming = useCallback(async () => {
    try {
      const res = await mentorBookingApi.getUpcomingBookings(10);
      setUpcoming(res.data);
      setUpcomingError(null);
    } catch {
      // non-fatal, stale data is acceptable
    }
    // Refresh stats too
    try {
      const res = await mentorBookingApi.getDashboardStats();
      setStats(res.data);
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // ── Socket-triggered refresh on new notification ──────────────────────────────
  useEffect(() => {
    const socket = notificationSocketManager.getSocket?.();
    if (!socket) return;

    const handleNotification = () => { void refreshUpcoming(); };
    socket.on('new_notification', handleNotification);
    return () => { socket.off('new_notification', handleNotification); };
  }, [refreshUpcoming]);

  return (
    <div className="min-h-full px-6 py-8 max-w-7xl mx-auto space-y-8">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white font-mono">Mentor Dashboard</h1>
          <p className="text-gray-500 text-sm font-mono mt-0.5">
            Welcome back, <span className="text-gray-300">{mentorName}</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NextSessionCountdown upcoming={upcoming} />
          <Link
            to="/mentor/bookings"
            className="text-xs px-3 py-1.5 rounded-lg border border-[#272b3a] text-gray-400 hover:text-white hover:border-[#3a3f52] transition-colors font-mono"
          >
            All Bookings →
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────────── */}
      <KpiCards stats={stats} isLoading={statsLoading} error={statsError} />

      {/* ── Main Grid ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upcoming Sessions — takes 2/3 */}
        <div className="xl:col-span-2">
          <UpcomingSessionsPanel
            sessions={upcoming}
            isLoading={upcomingLoading}
            error={upcomingError}
            onCancel={refreshUpcoming}
          />
        </div>

        {/* Today's Timeline — takes 1/3 */}
        <div className="xl:col-span-1">
          <TodayTimeline
            sessions={upcoming}
            isLoading={upcomingLoading}
            error={upcomingError}
          />
        </div>
      </div>
    </div>
  );
};

export default MentorDashboardPage;
