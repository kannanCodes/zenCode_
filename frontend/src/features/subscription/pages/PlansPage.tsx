import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store';
import {
  changePlan,
  fetchSubscription,
  resumeSubscription,
  selectCurrentPlanId,
  selectCurrentPlanPrice,
  selectSubscription,
  selectSubscriptionUiState,
} from '../../../store/slices/subscriptionSlice';
import { planService } from '../services/plan.service';
import type { Plan } from '../types/subscription.types';
import PlanCard from '../components/PlanCard';
import { PlanCardSkeleton } from '../components/SubscriptionSkeleton';
import Navbar from '../../../shared/components/Navbar';
import { showError, showSuccess } from '../../../shared/utils/toast.util';

const PlansPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isMounted = useRef(true);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [changingPlanId, setChangingPlanId] = useState<string | null>(null);
  const [isResumingSubscription, setIsResumingSubscription] = useState(false);

  const currentPlanId = useSelector(selectCurrentPlanId);
  const currentPlanPrice = useSelector(selectCurrentPlanPrice);
  const subscription = useSelector(selectSubscription);
  const subscriptionUiState = useSelector(selectSubscriptionUiState);
  const { isLoading: isSubLoading, subscriptionStatus } = useSelector(
    (state: RootState) => state.subscription
  );

  // ─── Load plans + sync subscription on mount ─────────────────────────────

  useEffect(() => {
    isMounted.current = true;

    const loadPlans = async () => {
      setIsLoadingPlans(true);
      try {
        const fetched = await planService.getPlans();
        if (isMounted.current) {
          setPlans(fetched.sort((a, b) => a.price - b.price));
        }
      } catch {
        showError('Failed to load plans. Please refresh.');
      } finally {
        if (isMounted.current) setIsLoadingPlans(false);
      }
    };

    loadPlans();
    dispatch(fetchSubscription());

    return () => { isMounted.current = false; };
  }, [dispatch]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleChangePlan = async (planId: string) => {
    setChangingPlanId(planId);
    try {
      const newPlan = plans.find(p => p._id === planId);
      const currentPrice = currentPlanPrice ?? 0;
      const nextPrice = newPlan?.price ?? currentPrice;
      await dispatch(changePlan({ planId })).unwrap();
      if (nextPrice > currentPrice) {
        return;
      }
      showSuccess(
        nextPrice < currentPrice
          ? `${newPlan?.name ?? 'New plan'} scheduled for the next billing period.`
          : `Switched to ${newPlan?.name ?? 'new plan'} successfully!`
      );
    } catch (err: any) {
      showError(typeof err === 'string' ? err : 'Failed to change plan. Please try again.');
    } finally {
      if (isMounted.current) setChangingPlanId(null);
    }
  };

  const handleResumeSubscription = async () => {
    setIsResumingSubscription(true);
    try {
      await dispatch(resumeSubscription()).unwrap();
      showSuccess('Auto-renew resumed. You can change plans again.');
    } catch {
      showError('Failed to resume auto-renew. Please try again.');
    } finally {
      if (isMounted.current) setIsResumingSubscription(false);
    }
  };

  // ─── Derived state ────────────────────────────────────────────────────────

  /**
   * Only actively renewing subscriptions can change plan.
   * active_cancel_scheduled users keep access, but cannot change plan until renewal is restored.
   */
  const canChangePlan =
    subscription !== null &&
    subscription.isActive === true &&
    subscriptionUiState === 'active';

  const isExpired = subscriptionStatus === 'expired';
  const isActiveCancelScheduled = subscriptionUiState === 'active_cancel_scheduled';
  const isLoading = isLoadingPlans || isSubLoading;
  const scheduledPlanId: string | null = (() => {
    const scheduled = subscription?.scheduledPlanId;
    if (!scheduled) return null;
    return typeof scheduled === 'string' ? scheduled : scheduled._id;
  })();
  const scheduledPlanName = (() => {
    const scheduled = subscription?.scheduledPlanId;
    if (scheduled && typeof scheduled === 'object') return scheduled.name;
    return plans.find((plan) => plan._id === scheduledPlanId)?.name;
  })();

  return (
    <div className="min-h-screen bg-[var(--color-background-dark)] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 pt-32 pb-24 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Level up your <span className="text-[var(--color-primary)]">coding journey</span>
          </h1>
          <p className="text-lg text-gray-400">
            Choose the plan that fits your goals. No hidden fees, cancel anytime.
          </p>

          {isExpired && (
            <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              Your subscription has expired. Choose a plan below to regain premium access.
            </div>
          )}

          {subscriptionUiState === 'active' && subscription?.endDate && (
            <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              Your subscription renews automatically on{' '}
              <span className="font-semibold">
                {new Date(subscription.endDate).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
              </span>
              . Use Change Plan if you want to switch before the next billing cycle.
            </div>
          )}

          {isActiveCancelScheduled && (
            <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
              Auto-renew is disabled. Your subscription will end on{' '}
              <span className="font-semibold">
                {subscription?.endDate
                  ? new Date(subscription.endDate).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })
                  : 'end of billing period'}
              </span>
              . Access remains active until then.
            </div>
          )}

          {subscription?.scheduledChangeAt && scheduledPlanName && (
            <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
              {subscription.scheduledChangeType === 'downgrade' ? 'Downgrade' : 'Plan change'} to{' '}
              <span className="font-semibold">{scheduledPlanName}</span> is scheduled for{' '}
              <span className="font-semibold">
                {new Date(subscription.scheduledChangeAt).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
              </span>
              . Your current features remain active until then.
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <>
              <PlanCardSkeleton />
              <PlanCardSkeleton />
              <PlanCardSkeleton />
            </>
          ) : plans.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">
              No active plans found. Please check back later.
            </div>
          ) : (
            plans.map((plan) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                isCurrentPlan={currentPlanId === plan._id && !isExpired}
                canChangePlan={canChangePlan}
                subscriptionUiState={subscriptionUiState}
                subscriptionEndDate={subscription?.endDate ?? null}
                scheduledPlanId={scheduledPlanId}
                scheduledChangeAt={subscription?.scheduledChangeAt ?? null}
                currentPlanPrice={currentPlanPrice}
                onChangePlan={handleChangePlan}
                onResumeSubscription={handleResumeSubscription}
                isChangingPlan={changingPlanId === plan._id}
                isResumingSubscription={isResumingSubscription}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default PlansPage;
