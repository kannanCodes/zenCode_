import { useNavigate } from 'react-router-dom';
import type { AdminPendingActions } from '../../types/dashboard';

interface Props {
  data: AdminPendingActions | null;
  isLoading: boolean;
  error: string | null;
}

const SkeletonRow = () => (
  <div className="flex items-center justify-between py-3 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-[#1c1c1c] rounded-lg" />
      <div className="h-3 bg-[#1c1c1c] rounded w-32" />
    </div>
    <div className="h-5 bg-[#1c1c1c] rounded w-8" />
  </div>
);

const PendingActionsPanel = ({ data, isLoading, error }: Props) => {
  const navigate = useNavigate();

  const allClear =
    data &&
    data.blockedUsersCount === 0 &&
    data.disabledMentorsCount === 0 &&
    data.failedSubscriptionsCount === 0 &&
    data.pendingInvitedMentorsCount === 0;

  const actions = data
    ? [
        {
          label: 'Blocked Users',
          count: data.blockedUsersCount,
          color: data.blockedUsersCount > 0 ? 'text-red-400' : 'text-gray-600',
          bg: data.blockedUsersCount > 0 ? 'bg-red-500/10' : 'bg-[#1a1a1a]',
          badge: data.blockedUsersCount > 0 ? 'bg-red-500/20 text-red-400' : 'bg-[#1c1c1c] text-gray-600',
          path: '/admin/users',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ),
        },
        {
          label: 'Disabled Mentors',
          count: data.disabledMentorsCount,
          color: data.disabledMentorsCount > 0 ? 'text-orange-400' : 'text-gray-600',
          bg: data.disabledMentorsCount > 0 ? 'bg-orange-500/10' : 'bg-[#1a1a1a]',
          badge: data.disabledMentorsCount > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-[#1c1c1c] text-gray-600',
          path: '/admin/mentors',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
            </svg>
          ),
        },
        {
          label: 'Failed Subscriptions',
          count: data.failedSubscriptionsCount,
          color: data.failedSubscriptionsCount > 0 ? 'text-red-400' : 'text-gray-600',
          bg: data.failedSubscriptionsCount > 0 ? 'bg-red-500/10' : 'bg-[#1a1a1a]',
          badge: data.failedSubscriptionsCount > 0 ? 'bg-red-500/20 text-red-400' : 'bg-[#1c1c1c] text-gray-600',
          path: '/admin/plan-management',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          label: 'Pending Mentor Invites',
          count: data.pendingInvitedMentorsCount,
          color: data.pendingInvitedMentorsCount > 0 ? 'text-amber-400' : 'text-gray-600',
          bg: data.pendingInvitedMentorsCount > 0 ? 'bg-amber-500/10' : 'bg-[#1a1a1a]',
          badge: data.pendingInvitedMentorsCount > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-[#1c1c1c] text-gray-600',
          path: '/admin/mentors',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
        },
      ]
    : [];

  return (
    <div className="rounded-xl border border-[#1c1c1c] bg-[#0f0f0f] p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Pending Actions</p>
          <p className="text-[10px] text-gray-600 font-mono mt-0.5">Items requiring attention</p>
        </div>
        {data && !allClear && (
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-0 divide-y divide-[#1a1a1a]">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
        ) : error ? (
          <div className="flex items-center justify-center h-32 text-red-400 text-xs font-mono">
            ⚠ {error}
          </div>
        ) : allClear ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-emerald-400 font-mono">All clear — no pending actions</p>
          </div>
        ) : (
          actions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="w-full flex items-center justify-between py-3 px-1 hover:bg-[#141414] transition-colors rounded-lg group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${action.bg} ${action.color} flex items-center justify-center shrink-0`}>
                  {action.icon}
                </div>
                <span className="text-xs text-gray-400 font-mono group-hover:text-gray-200 transition-colors">
                  {action.label}
                </span>
              </div>
              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${action.badge}`}>
                {action.count}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingActionsPanel;
