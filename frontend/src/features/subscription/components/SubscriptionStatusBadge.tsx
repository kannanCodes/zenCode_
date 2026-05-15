import type { SubscriptionStatus } from '../types/subscription.types';

interface Props {
  status: SubscriptionStatus;
  endDate?: string | null;
}

const config: Record<SubscriptionStatus, { label: string; classes: string; dot: string }> = {
  active: {
    label: 'Active',
    classes: 'bg-green-500/10 text-green-400 border-green-500/30',
    dot: 'bg-green-400',
  },
  cancelled: {
    label: 'Cancelled',
    classes: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    dot: 'bg-yellow-400',
  },
  expired: {
    label: 'Expired',
    classes: 'bg-red-500/10 text-red-400 border-red-500/30',
    dot: 'bg-red-400',
  },
};

const SubscriptionStatusBadge = ({ status, endDate }: Props) => {
  const cfg = config[status];

  // Cancelled but within billing period → show "Expires on..." hint
  const isCancelledButActive =
    status === 'cancelled' && endDate && new Date(endDate) > new Date();

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${cfg.classes}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${cfg.dot}`} />
        {cfg.label}
      </span>
      {isCancelledButActive && (
        <span className="text-xs text-yellow-400/70 pl-1">
          Access until {new Date(endDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      )}
    </div>
  );
};

export default SubscriptionStatusBadge;
