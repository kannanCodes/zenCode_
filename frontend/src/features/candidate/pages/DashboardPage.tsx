import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import { dashboardService, type DashboardData } from '../services/dashboard.service';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { showError } from '../../../shared/utils/toast.util';

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

function getStatusLabel(status: string): { label: string; color: string } {
  if (status === 'accepted') return { label: 'PASSED', color: 'text-green-400 bg-green-500/10' };
  return { label: 'FAILED', color: 'text-red-400 bg-red-500/10' };
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await dashboardService.getDashboard();
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) showError('Failed to load dashboard');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#2a2d3a] border-t-[var(--color-primary)] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const streak = data?.streak ?? { current: 0, best: 0 };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-12 space-y-6">

        {/* ── Streak Banner ────────────────────────────────────────── */}
        <div className="flex items-center justify-between bg-[#0f1117] border border-[#1e2130] rounded-2xl px-8 py-6">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-[#1a1d2e] border border-[#2a2d3a] flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 2c0 0-7.5 8-7.5 13a7.5 7.5 0 0015 0c0-3.5-2-7-3.5-9.5-.5 1.5-1 3-2.5 4 .5-3-.5-5.5-1.5-7.5z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-mono">
                Today's Streak:{' '}
                <span className="text-[var(--color-primary)]">
                  {streak.current}-Day Streak
                </span>
              </h2>
              <p className="text-gray-400 text-sm mt-0.5">
                Best Streak: {streak.best} days · Keep your momentum going!
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/problems')}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold rounded-xl transition-colors whitespace-nowrap"
          >
            Continue Practising →
          </button>
        </div>

        {/* ── Quick Action Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Problem Library */}
          <div className="bg-[#0f1117] border border-[#1e2130] rounded-2xl p-6 flex flex-col gap-6">
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#1a1d2e] border border-[#2a2d3a] flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-base">Problem Library</h3>
              <p className="text-gray-500 text-sm mt-1">Solve problems by difficulty and tags</p>
            </div>
            <button
              onClick={() => navigate('/problems')}
              className="w-full py-2.5 rounded-xl border border-[#2a2d3a] text-white text-sm font-medium hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all"
            >
              Browse Problems
            </button>
          </div>

          {/* Mock Interview */}
          <div className="bg-[#0f1117] border border-[#1e2130] rounded-2xl p-6 flex flex-col gap-6">
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#1a1d2e] border border-[#2a2d3a] flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-base">Mock Interview</h3>
              <p className="text-gray-500 text-sm mt-1">Book a session with a mentor</p>
            </div>
            <button
              onClick={() => navigate('/candidate/mentors')}
              className="w-full py-2.5 rounded-xl border border-[#2a2d3a] text-white text-sm font-medium hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all"
            >
              Book Slot
            </button>
          </div>
        </div>

        {/* ── Bottom Row: Heatmap + Recent Submissions ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Activity Heatmap */}
          <div className="lg:col-span-2 bg-[#0f1117] border border-[#1e2130] rounded-2xl p-6">
            <div className="mb-4">
              <h3 className="text-white font-semibold text-base">Your Activity</h3>
              <p className="text-gray-500 text-sm mt-0.5">Track your consistency over time</p>
            </div>
            <ActivityHeatmap data={data?.heatmap ?? []} />
          </div>

          {/* Recent Submissions */}
          <div className="bg-[#0f1117] border border-[#1e2130] rounded-2xl p-6">
            <h3 className="text-white font-semibold text-base mb-4">Recent Submissions</h3>

            {(data?.recentSubmissions ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-gray-500 text-sm">No submissions yet.</p>
                <button
                  onClick={() => navigate('/problems')}
                  className="mt-3 text-[var(--color-primary)] text-sm hover:underline"
                >
                  Start solving →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {(data?.recentSubmissions ?? []).map((sub) => {
                  const { label, color } = getStatusLabel(sub.status);
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between gap-2 cursor-pointer group"
                      onClick={() => navigate(`/problems/${sub.problemId}`)}
                    >
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate group-hover:text-[var(--color-primary)] transition-colors">
                          {sub.problemTitle}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {sub.language} · {timeAgo(sub.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${color}`}>
                          {label}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/problems/${sub.problemId}`); }}
                          className="text-gray-500 hover:text-white transition-colors"
                          aria-label="View problem"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
