import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Plan, SubscriptionUiState } from '../types/subscription.types';
import { paymentService } from '../services/payment.service';
import { showError } from '../../../shared/utils/toast.util';

interface Props {
  plan: Plan;
  isCurrentPlan: boolean;
  /** True only if user has an ACTIVE (or cancelled-but-still-active) subscription */
  canChangePlan: boolean;
  subscriptionUiState?: SubscriptionUiState | null;
  subscriptionEndDate?: string | null;
  scheduledPlanId?: string | null;
  scheduledChangeAt?: string | null;
  /** Price of user's current plan — used to determine Upgrade vs Downgrade label */
  currentPlanPrice: number | null;
  onChangePlan: (planId: string) => Promise<void>;
  onResumeSubscription?: () => Promise<void>;
  isChangingPlan: boolean;
  isResumingSubscription?: boolean;
}

const CheckIcon = () => (
  <svg className="w-4 h-4 text-[#2D5FFF] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CrossIcon = () => (
  <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Spinner = () => (
  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
);

const PlanCard = ({
  plan,
  isCurrentPlan,
  canChangePlan,
  subscriptionUiState,
  subscriptionEndDate,
  scheduledPlanId,
  scheduledChangeAt,
  currentPlanPrice,
  onChangePlan,
  onResumeSubscription,
  isChangingPlan,
  isResumingSubscription,
}: Props) => {
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleBuyNow = async () => {
    setIsCheckingOut(true);
    try {
      const { url } = await paymentService.createCheckout({ planId: plan._id });
      window.location.href = url;
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? 'Failed to start checkout';
      if (
        msg.toLowerCase().includes('already have an active') ||
        msg.toLowerCase().includes('duplicate')
      ) {
        showError('You already have an active subscription. Manage it from your account.');
        navigate('/subscription/manage');
      } else {
        showError(msg);
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleChangePlan = async () => {
    try {
      await onChangePlan(plan._id);
    } catch {
      // errors handled by parent
    }
  };

  // ─── Derived UI state ────────────────────────────────────────────────────────

  const formatPrice = (price: number, cycle: string) =>
    price === 0 ? 'Free' : `₹${price}/${cycle === 'monthly' ? 'mo' : 'yr'}`;

  const isLoading = isCheckingOut || isChangingPlan;
  const formattedEndDate = subscriptionEndDate
    ? new Date(subscriptionEndDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;
  const currentPlanHint =
    subscriptionUiState === 'active' && formattedEndDate
      ? `Auto-renews on ${formattedEndDate}`
      : subscriptionUiState === 'active_cancel_scheduled' && formattedEndDate
      ? `Access until ${formattedEndDate} · Auto-renew disabled`
      : subscriptionUiState === 'expired' || subscriptionUiState === 'cancelled'
      ? 'Expired'
      : null;
  const isScheduledTarget = scheduledPlanId === plan._id;
  const isRenewalDisabled = subscriptionUiState === 'active_cancel_scheduled';
  const scheduledDate = scheduledChangeAt
    ? new Date(scheduledChangeAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  // Determine button label for the upgrade/downgrade case
  const getChangePlanLabel = (): string => {
    if (isChangingPlan) return '';
    if (currentPlanPrice === null) return 'Switch Plan';
    if (plan.price > currentPlanPrice) return 'Upgrade and Pay';
    if (plan.price < currentPlanPrice) return 'Schedule Downgrade';
    return 'Switch Plan';
  };
  const planNameLower = plan.name.toLowerCase();
  const planBadgeLabel = planNameLower.includes('pro')
    ? 'PRO'
    : planNameLower.includes('basic')
    ? 'BASIC'
    : plan.price > 0
    ? 'PAID'
    : '';

  return (
    <div
      className={`relative flex flex-col p-6 rounded-xl border transition-all duration-300 ${
        isCurrentPlan
          ? 'border-[#2D5FFF] bg-[#2D5FFF]/5 shadow-[0_0_30px_rgba(45,95,255,0.15)]'
          : 'border-[#272b3a] bg-[#111111] hover:border-[#2D5FFF]/40 hover:shadow-[0_0_20px_rgba(45,95,255,0.08)]'
      }`}
    >
      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D5FFF] text-white text-xs font-bold shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
            Current Plan
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-bold text-white">{plan.name}</h3>
          {planBadgeLabel && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-semibold">
              {planBadgeLabel}
            </span>
          )}
          {isCurrentPlan && isRenewalDisabled && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold">
              Renewal disabled
            </span>
          )}
        </div>
        <div className="text-3xl font-bold text-white mt-2">
          {formatPrice(plan.price, plan.billingCycle)}
        </div>
        {plan.price > 0 && (
          <p className="text-xs text-gray-500 mt-1">billed {plan.billingCycle}</p>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">{plan.description}</p>

      {/* Features */}
      <ul className="flex flex-col gap-2.5 mb-6 flex-1">
        {plan.features.filter(f => f.enabled).map((feature, i) => (
          <li key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
            <CheckIcon />
            {feature.name}
          </li>
        ))}
      </ul>

      {/* Access Rights */}
      <div className="flex flex-col gap-2 mb-6 p-3 rounded-lg bg-[#0a0a0a] border border-[#272b3a]">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Access</p>
        {[
          { key: 'premiumProblems', label: 'Premium Problems' },
          { key: 'aiHints', label: 'AI Hints' },
          { key: 'mentorBooking', label: 'Mentor Booking' },
        ].map(({ key, label }) => {
          const hasAccess = plan.access[key as keyof typeof plan.access];
          return (
            <div key={key} className="flex items-center gap-2">
              {hasAccess ? <CheckIcon /> : <CrossIcon />}
              <span className={`text-xs ${hasAccess ? 'text-gray-300' : 'text-gray-600'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* CTA Button */}
      {isCurrentPlan ? (
        <div className="flex flex-col gap-2">
          <button
            disabled
            className="w-full h-10 rounded-md bg-[#2D5FFF]/20 border border-[#2D5FFF]/40 text-[#2D5FFF] text-sm font-semibold cursor-not-allowed opacity-70"
          >
            Current Plan
          </button>
          {currentPlanHint && (
            <p className="text-center text-xs text-gray-500">{currentPlanHint}</p>
          )}
        </div>
      ) : isScheduledTarget ? (
        <div className="flex flex-col gap-2">
          <button
            disabled
            className="w-full h-10 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-semibold cursor-not-allowed"
          >
            Scheduled
          </button>
          {scheduledDate && (
            <p className="text-center text-xs text-gray-500">Starts on {scheduledDate}</p>
          )}
        </div>
      ) : canChangePlan ? (
        /* User has active subscription → upgrade or downgrade */
        <button
          onClick={handleChangePlan}
          disabled={isLoading}
          className="w-full h-10 rounded-md border border-[#2D5FFF] text-[#2D5FFF] hover:bg-[#2D5FFF] hover:text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isChangingPlan ? (
            <><Spinner /> Switching...</>
          ) : (
            getChangePlanLabel()
          )}
        </button>
      ) : subscriptionUiState === 'active_cancel_scheduled' ? (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onResumeSubscription}
            disabled={!onResumeSubscription || isResumingSubscription}
            className="w-full h-10 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/15 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isResumingSubscription ? (
              <><Spinner /> Resuming...</>
            ) : (
              'Resume Auto-Renew'
            )}
          </button>
          {formattedEndDate && (
            <p className="text-center text-xs text-yellow-400/70">
              Required before changing plans. Access until {formattedEndDate}.
            </p>
          )}
        </div>
      ) : subscriptionUiState === 'past_due' || subscriptionUiState === 'unpaid' ? (
        <button
          disabled
          className="w-full h-10 rounded-md bg-[#1a1d26] text-gray-500 border border-[#272b3a] text-sm font-semibold cursor-not-allowed"
        >
          Resolve billing to change plans
        </button>
      ) : (
        /* No subscription → buy now (free plan is always disabled) */
        <button
          onClick={handleBuyNow}
          disabled={isLoading || plan.price === 0}
          className={`w-full h-10 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
            plan.price === 0
              ? 'bg-[#1a1d26] text-gray-500 opacity-60'
              : 'bg-[#2D5FFF] hover:bg-blue-600 text-white hover:shadow-[0_0_20px_rgba(45,95,255,0.35)] disabled:opacity-50'
          }`}
        >
          {isCheckingOut ? (
            <><Spinner /> Redirecting...</>
          ) : plan.price === 0 ? (
            'Free — No Action Needed'
          ) : (
            'Get Started'
          )}
        </button>
      )}
    </div>
  );
};

export default PlanCard;
