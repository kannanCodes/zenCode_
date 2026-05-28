import type { DailyDataPoint } from '../../types/dashboard';

interface Props {
  data: DailyDataPoint[];
  completedSessions: number;
  cancelledSessions: number;
  totalSessions: number;
  isLoading: boolean;
  error: string | null;
}

const CHART_HEIGHT = 80;

const Skeleton = () => (
  <div className="rounded-xl border border-[#1c1c1c] bg-[#0f0f0f] p-5 animate-pulse">
    <div className="h-4 bg-[#1c1c1c] rounded w-40 mb-4" />
    <div className="flex gap-4 mb-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-10 bg-[#1c1c1c] rounded flex-1" />
      ))}
    </div>
    <div className="h-20 bg-[#1c1c1c] rounded" />
  </div>
);

const SessionAnalyticsCard = ({
  data,
  completedSessions,
  cancelledSessions,
  totalSessions,
  isLoading,
  error,
}: Props) => {
  if (isLoading) return <Skeleton />;

  const completionRate =
    totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;

  const cancellationRate =
    totalSessions > 0
      ? Math.round((cancelledSessions / totalSessions) * 100)
      : 0;

  // Build bar chart
  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = data.length > 0 ? 100 / data.length : 10;

  return (
    <div className="rounded-xl border border-cyan-500/10 bg-[#0f0f0f] p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Session Analytics</p>
          <p className="text-xl font-bold text-cyan-400 mt-0.5">{totalSessions.toLocaleString()} total</p>
        </div>
        <span className="text-cyan-400 bg-[#1a1d26] p-1.5 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </span>
      </div>

      {error && (
        <div className="text-red-400 text-xs font-mono mb-3">⚠ {error}</div>
      )}

      {/* Rate metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-emerald-400 font-mono">{completionRate}%</p>
          <p className="text-[10px] text-gray-600 font-mono mt-0.5">Completion</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-red-400 font-mono">{cancellationRate}%</p>
          <p className="text-[10px] text-gray-600 font-mono mt-0.5">Cancellation</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-cyan-400 font-mono">{completedSessions}</p>
          <p className="text-[10px] text-gray-600 font-mono mt-0.5">Completed</p>
        </div>
      </div>

      {/* Bar chart — sessions per day */}
      {data.length > 0 ? (
        <div className="flex-1">
          <p className="text-[10px] text-gray-700 font-mono mb-2">Sessions per day (30d)</p>
          <div className="flex items-end gap-0.5" style={{ height: `${CHART_HEIGHT}px` }}>
            {data.map((d, i) => {
              const heightPct = max > 0 ? (d.value / max) * 100 : 0;
              return (
                <div
                  key={i}
                  className="flex-1 bg-cyan-400/30 hover:bg-cyan-400/60 transition-colors rounded-sm cursor-default group relative"
                  style={{ height: `${Math.max(heightPct, 2)}%` }}
                  title={`${d.date}: ${d.value} sessions`}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-[#1a1a1a] border border-[#2a2d3a] text-[9px] text-gray-300 font-mono px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                    {d.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-700 text-xs font-mono">
          No session data for last 30 days
        </div>
      )}
    </div>
  );
};

export default SessionAnalyticsCard;
