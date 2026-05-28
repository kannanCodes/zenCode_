import type { AdminDashboardStats } from '../../types/dashboard';

interface Props {
  stats: AdminDashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

const SkeletonCard = () => (
  <div className="rounded-xl border border-[#1c1c1c] bg-[#0f0f0f] p-5 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-3 bg-[#1c1c1c] rounded w-28" />
      <div className="w-8 h-8 bg-[#1c1c1c] rounded-lg" />
    </div>
    <div className="h-8 bg-[#1c1c1c] rounded w-16 mb-2" />
    <div className="space-y-1.5">
      <div className="h-2.5 bg-[#1c1c1c] rounded w-32" />
      <div className="h-2.5 bg-[#1c1c1c] rounded w-28" />
    </div>
  </div>
);

interface CardDef {
  label: string;
  primaryValue: string | number;
  accent: string;
  border: string;
  icon: React.ReactNode;
  breakdown: Array<{ label: string; value: string | number }>;
}

const buildCards = (s: AdminDashboardStats): CardDef[] => [
  {
    label: 'Total Users',
    primaryValue: s.totalUsers.toLocaleString(),
    accent: 'text-indigo-400',
    border: 'border-indigo-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    breakdown: [
      { label: 'Mentors', value: s.totalMentors },
      { label: 'Candidates', value: s.totalCandidates },
    ],
  },
  {
    label: 'Subscriptions',
    primaryValue: s.activeSubscriptions.toLocaleString(),
    accent: 'text-emerald-400',
    border: 'border-emerald-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    breakdown: [
      { label: 'Monthly', value: s.monthlySubscriptions },
      { label: 'Yearly', value: s.yearlySubscriptions },
    ],
  },
  {
    label: 'Sessions',
    primaryValue: s.totalSessions.toLocaleString(),
    accent: 'text-cyan-400',
    border: 'border-cyan-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      </svg>
    ),
    breakdown: [
      { label: 'Live now', value: s.activeSessions },
      { label: 'Completed', value: s.completedSessions },
      { label: 'Cancelled', value: s.cancelledSessions },
    ],
  },
  {
    label: 'Revenue',
    primaryValue: `₹${s.totalRevenue.toLocaleString()}`,

    accent: 'text-amber-400',
    border: 'border-amber-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    breakdown: [
      { label: 'Monthly', value: `₹${s.monthlyRevenue.toLocaleString('en-IN')}` },
      { label: 'Yearly', value: `₹${s.yearlyRevenue.toLocaleString('en-IN')}` },
      { label: 'Avg/user', value: `₹${s.avgRevenuePerUser}` },
    ],
  },
  {
    label: 'Problems',
    primaryValue: s.totalProblems.toLocaleString(),
    accent: 'text-violet-400',
    border: 'border-violet-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    breakdown: [
      { label: 'Premium', value: s.premiumProblems },
      { label: 'Submissions today', value: s.submissionsToday },
      { label: 'Acceptance', value: `${s.acceptanceRate}%` },
    ],
  },
];

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
        ⚠ Failed to load KPI stats — {error ?? 'Unknown error'}
      </div>
    );
  }

  const cards = buildCards(stats);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border ${card.border} bg-[#0f0f0f] p-5 hover:bg-[#141414] transition-colors group`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-mono">{card.label}</span>
            <span className={`${card.accent} bg-[#1a1d26] p-1.5 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
              {card.icon}
            </span>
          </div>
          <div className={`text-3xl font-bold ${card.accent} mb-3`}>{card.primaryValue}</div>
          <div className="space-y-1">
            {card.breakdown.map((b) => (
              <div key={b.label} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 font-mono">{b.label}</span>
                <span className="text-xs text-gray-400 font-mono font-medium">{b.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiCards;
