import type { AdminDashboardActivity, ActivityEventType } from '../../types/dashboard';

interface Props {
  items: AdminDashboardActivity[];
  isLoading: boolean;
  error: string | null;
}

const EVENT_CONFIG: Record<
  ActivityEventType,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  booking_confirmed: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  booking_cancelled: {
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  session_started: {
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  session_ended: {
    color: 'text-gray-400',
    bg: 'bg-gray-500/10',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
  },
  subscription_activated: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  subscription_cancelled: {
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
  mentor_registered: {
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  user_registered: {
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const SkeletonItem = () => (
  <div className="flex items-start gap-3 py-3 animate-pulse">
    <div className="w-8 h-8 rounded-lg bg-[#1c1c1c] shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 bg-[#1c1c1c] rounded w-4/5" />
      <div className="h-2.5 bg-[#1c1c1c] rounded w-20" />
    </div>
  </div>
);

const RecentActivityFeed = ({ items, isLoading, error }: Props) => {
  return (
    <div className="rounded-xl border border-[#1c1c1c] bg-[#0f0f0f] p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Recent Activity</p>
          <p className="text-[10px] text-gray-600 font-mono mt-0.5">Latest 20 platform events</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-0 divide-y divide-[#1a1a1a]" style={{ maxHeight: '280px' }}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonItem key={i} />)
        ) : error ? (
          <div className="flex items-center justify-center h-32 text-red-400 text-xs font-mono">
            ⚠ {error}
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-700 text-xs font-mono">
            No activity yet
          </div>
        ) : (
          items.map((item) => {
            const cfg = EVENT_CONFIG[item.type] ?? EVENT_CONFIG.user_registered;
            return (
              <div key={item.id} className="flex items-start gap-3 py-3 hover:bg-[#141414] transition-colors px-1 rounded-lg">
                <div className={`w-8 h-8 rounded-lg ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 font-mono leading-relaxed truncate">
                    {item.description}
                  </p>
                  <p className="text-[10px] text-gray-600 font-mono mt-0.5">
                    {timeAgo(item.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentActivityFeed;
