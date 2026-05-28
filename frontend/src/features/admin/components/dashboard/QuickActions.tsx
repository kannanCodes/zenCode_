import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  path: string;
  accent: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
}

const actions: QuickAction[] = [
  {
    id: 'create-problem',
    label: 'Create Problem',
    description: 'Add a new coding challenge',
    path: '/admin/problems/create',
    accent: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    id: 'manage-plans',
    label: 'Manage Plans',
    description: 'Edit subscription plans',
    path: '/admin/plan-management',
    accent: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'manage-mentors',
    label: 'Manage Mentors',
    description: 'View & control mentor accounts',
    path: '/admin/mentors',
    accent: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'manage-users',
    label: 'Manage Users',
    description: 'Review & block candidates',
    path: '/admin/users',
    accent: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: 'all-problems',
    label: 'All Problems',
    description: 'Browse problem library',
    path: '/admin/problems',
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-[#1c1c1c] bg-[#0f0f0f] p-5">
      <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-4">Quick Actions</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            id={`quick-action-${action.id}`}
            onClick={() => navigate(action.path)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${action.border} ${action.bg} hover:scale-[1.03] active:scale-[0.98] transition-all group`}
          >
            <span className={`${action.accent} transition-colors`}>{action.icon}</span>
            <span className={`text-xs font-bold font-mono ${action.accent} text-center leading-tight`}>
              {action.label}
            </span>
            <span className="text-[10px] text-gray-600 font-mono text-center leading-tight">
              {action.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
