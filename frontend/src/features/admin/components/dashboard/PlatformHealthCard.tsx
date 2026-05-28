import type { AdminDashboardStats } from '../../types/dashboard';

interface Props {
  stats: AdminDashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

interface StatusItem {
  label: string;
  value: string | number;
  status: 'live' | 'idle' | 'info';
}

const PlatformHealthCard = ({ stats, isLoading, error }: Props) => {
  const items: StatusItem[] = stats
    ? [
        {
          label: 'Active Live Sessions',
          value: stats.activeSessions,
          status: stats.activeSessions > 0 ? 'live' : 'idle',
        },
        {
          label: 'Active Mentors (ACTIVE)',
          value: stats.totalMentors,
          status: 'info',
        },
        {
          label: 'Total Candidates',
          value: stats.totalCandidates,
          status: 'info',
        },
        {
          label: 'Premium Subscribers',
          value: stats.activeSubscriptions,
          status: stats.activeSubscriptions > 0 ? 'live' : 'idle',
        },
        {
          label: 'Submissions Today',
          value: stats.submissionsToday,
          status: stats.submissionsToday > 0 ? 'live' : 'idle',
        },
      ]
    : [];

  const statusColor = {
    live: 'bg-emerald-400',
    idle: 'bg-gray-600',
    info: 'bg-cyan-400',
  };

  const valueColor = {
    live: 'text-emerald-400',
    idle: 'text-gray-500',
    info: 'text-cyan-400',
  };

  return (
    <div className="rounded-xl border border-[#1c1c1c] bg-[#0f0f0f] p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Platform Health</p>
          <p className="text-[10px] text-gray-600 font-mono mt-0.5">Live system status</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-mono">ONLINE</span>
        </div>
      </div>

      {/* Status Items */}
      <div className="flex-1 space-y-0 divide-y divide-[#1a1a1a]">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#1c1c1c]" />
                <div className="h-3 bg-[#1c1c1c] rounded w-36" />
              </div>
              <div className="h-3 bg-[#1c1c1c] rounded w-8" />
            </div>
          ))
        ) : error ? (
          <div className="flex items-center justify-center h-32 text-red-400 text-xs font-mono">
            ⚠ {error}
          </div>
        ) : (
          items.map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${statusColor[item.status]} ${item.status === 'live' ? 'animate-pulse' : ''}`} />
                <span className="text-xs text-gray-500 font-mono">{item.label}</span>
              </div>
              <span className={`text-sm font-bold font-mono ${valueColor[item.status]}`}>
                {item.value}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer note */}
      <div className="mt-3 pt-3 border-t border-[#1a1a1a]">
        <p className="text-[10px] text-gray-700 font-mono text-center">
          WebSocket monitoring • Queue health • Redis status coming soon
        </p>
      </div>
    </div>
  );
};

export default PlatformHealthCard;
