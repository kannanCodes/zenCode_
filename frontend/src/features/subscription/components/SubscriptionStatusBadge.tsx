import type { SubscriptionUiState } from '../types/subscription.types';

interface Props {
  state: SubscriptionUiState;
  endDate?: string | null;
}

const config: Record<SubscriptionUiState, { label: string; classes: string; dot: string }> = {
  active: {
    label: 'Active',
    classes: 'bg-green-500/10 text-green-400 border-green-500/30',
    dot: 'bg-green-400',
  },
  active_cancel_scheduled: {
    label: 'Renewal Disabled',
    classes: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    dot: 'bg-yellow-400',
  },
  cancelled: {
    label: 'Ended',
    classes: 'bg-red-500/10 text-red-400 border-red-500/30',
    dot: 'bg-red-400',
  },
  expired: {
    label: 'Expired',
    classes: 'bg-red-500/10 text-red-400 border-red-500/30',
    dot: 'bg-red-400',
  },
  past_due: {
    label: 'Past Due',
    classes: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    dot: 'bg-yellow-400',
  },
  unpaid: {
    label: 'Unpaid',
    classes: 'bg-red-500/10 text-red-400 border-red-500/30',
    dot: 'bg-red-400',
  },
};

const SubscriptionStatusBadge = ({ state, endDate }: Props) => {
  const cfg = config[state];

  const formattedEndDate = endDate
    ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const isActive = state === 'active' && formattedEndDate;
  const isRenewalDisabled = state === 'active_cancel_scheduled' && formattedEndDate;

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${cfg.classes}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${cfg.dot}`} />
        {cfg.label}
      </span>
      {isActive && (
        <span className="text-xs text-green-400/70 pl-1">
          Renews on {formattedEndDate}
        </span>
      )}
      {isRenewalDisabled && (
        <span className="text-xs text-yellow-400/70 pl-1">
          Access until {formattedEndDate}
        </span>
      )}
    </div>
  );
};

export default SubscriptionStatusBadge;
