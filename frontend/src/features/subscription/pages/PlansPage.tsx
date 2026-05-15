import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store';
import {
  changePlan,
  fetchSubscription,
  selectCurrentPlanId,
  selectCurrentPlanPrice,
  selectSubscription,
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

  const currentPlanId = useSelector(selectCurrentPlanId);
  const currentPlanPrice = useSelector(selectCurrentPlanPrice);
  const subscription = useSelector(selectSubscription);
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
      await dispatch(changePlan({ planId })).unwrap();
      const newPlan = plans.find(p => p._id === planId);
      showSuccess(`Switched to ${newPlan?.name ?? 'new plan'} successfully!`);
    } catch (err: any) {
      showError(typeof err === 'string' ? err : 'Failed to change plan. Please try again.');
    } finally {
      if (isMounted.current) setChangingPlanId(null);
    }
  };

  // ─── Derived state ────────────────────────────────────────────────────────

  /**
   * canChangePlan = user has an ACTIVE subscription (not expired).
   * Cancelled subscriptions that are still within their billing period also qualify.
   * Expired subscriptions must buy a new plan fresh.
   */
  const canChangePlan =
    subscription !== null &&
    subscription.isActive === true &&
    (subscriptionStatus === 'active' || subscriptionStatus === 'cancelled');

  const isExpired = subscriptionStatus === 'expired';
  const isCancelledActive = subscriptionStatus === 'cancelled' && subscription?.isActive === true;
  const isLoading = isLoadingPlans || isSubLoading;

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
              ⚠️ Your subscription has expired. Renew below to regain premium access.
            </div>
          )}

          {isCancelledActive && (
            <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
              Your subscription is cancelled but remains active until{' '}
              <span className="font-semibold">
                {subscription?.endDate
                  ? new Date(subscription.endDate).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })
                  : 'end of billing period'}
              </span>
              . You can still upgrade or downgrade.
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
                isCurrentPlan={currentPlanId === plan._id}
                canChangePlan={canChangePlan}
                currentPlanPrice={currentPlanPrice}
                onChangePlan={handleChangePlan}
                isChangingPlan={changingPlanId === plan._id}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default PlansPage;
