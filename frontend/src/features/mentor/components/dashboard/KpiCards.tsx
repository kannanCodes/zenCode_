import type { MentorDashboardStats } from '../../types/booking';

interface Props {
  stats: MentorDashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

const statCards = (stats: MentorDashboardStats) => [
  {
    label: 'Upcoming Sessions',
    value: stats.upcomingCount,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    accent: 'text-indigo-400',
    border: 'border-indigo-500/20',
    glow: 'shadow-indigo-500/5',
  },
  {
    label: 'Sessions Today',
    value: stats.todayCount,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.71.71M6.34 17.66l-.71.71m12.02 0-.71-.71M6.34 6.34l-.71-.71M12 7a5 5 0 100 10A5 5 0 0012 7z" />
      </svg>
    ),
    accent: 'text-amber-400',
    border: 'border-amber-500/20',
    glow: 'shadow-amber-500/5',
  },
  {
    label: 'Total Sessions',
    value: stats.totalSessions,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    accent: 'text-cyan-400',
    border: 'border-cyan-500/20',
    glow: 'shadow-cyan-500/5',
  },
  {
    label: 'Active Students',
    value: stats.activeStudents,
    sublabel: 'last 30 days',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    accent: 'text-emerald-400',
    border: 'border-emerald-500/20',
    glow: 'shadow-emerald-500/5',
  },
  {
    label: 'Completion Rate',
    value: `${stats.completionRate}%`,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: 'text-violet-400',
    border: 'border-violet-500/20',
    glow: 'shadow-violet-500/5',
  },
];

const SkeletonCard = () => (
  <div className="rounded-xl border border-[#1c1c1c] bg-[#111111] p-5 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-3 bg-[#1c1c1c] rounded w-24" />
      <div className="w-8 h-8 bg-[#1c1c1c] rounded-lg" />
    </div>
    <div className="h-8 bg-[#1c1c1c] rounded w-12" />
  </div>
);

const KpiCards = ({ stats, isLoading, error }: Props) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-400 text-sm font-mono">
        ⚠ Failed to load stats — {error ?? 'Unknown error'}
      </div>
    );
  }

  const cards = statCards(stats);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border ${card.border} bg-[#111111] p-5 shadow-lg ${card.glow} hover:bg-[#141414] transition-colors`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-mono">{card.label}</span>
            <span className={`${card.accent} bg-[#1a1d26] p-1.5 rounded-lg`}>{card.icon}</span>
          </div>
          <div className={`text-3xl font-bold ${card.accent}`}>{card.value}</div>
          {card.sublabel && <div className="text-xs text-gray-600 mt-1 font-mono">{card.sublabel}</div>}
        </div>
      ))}
    </div>
  );
};

export default KpiCards;
