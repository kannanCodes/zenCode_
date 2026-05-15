import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../store';
import {
  cancelSubscription,
  fetchSubscription,
} from '../../../store/slices/subscriptionSlice';
import Navbar from '../../../shared/components/Navbar';
import SubscriptionStatusBadge from '../components/SubscriptionStatusBadge';
import { ManageSubscriptionSkeleton } from '../components/SubscriptionSkeleton';
import { showError, showSuccess } from '../../../shared/utils/toast.util';

const ConfirmDialog = ({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  isDanger,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div className="w-full max-w-sm bg-[#111111] border border-[#272b3a] rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{message}</p>
      <div className="flex gap-3 mt-2">
        <button
          onClick={onCancel}
          className="flex-1 h-10 rounded-lg border border-[#272b3a] text-gray-300 hover:bg-[#1a1d26] transition-all text-sm font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 h-10 rounded-lg text-white text-sm font-semibold transition-all ${
            isDanger
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-[var(--color-primary)] hover:bg-blue-600'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

const ManageSubscriptionPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { subscription, isLoading, subscriptionStatus } = useSelector(
    (state: RootState) => state.subscription
  );

  // Local dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchSubscription());
  }, [dispatch]);

  const handleCancelConfirm = async () => {
    setShowCancelDialog(false);
    try {
      await dispatch(cancelSubscription()).unwrap();
      showSuccess('Subscription cancelled. You retain access until the billing period ends.');
    } catch {
      showError('Failed to cancel subscription. Please try again.');
    }
  };

  // ─── Derived values ───────────────────────────────────────────────────────

  const isActive = subscriptionStatus === 'active';
  const isCancelled = subscriptionStatus === 'cancelled';
  const isExpired = subscriptionStatus === 'expired';
  const isActiveCancelled = isCancelled && subscription?.isActive === true;

  const planObj = subscription && typeof subscription.planId === 'object' ? subscription.planId : null;
  const planName = planObj?.name ?? 'Premium Plan';
  const planPrice = planObj?.price ?? 0;
  const planCycle = planObj?.billingCycle ?? 'monthly';

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[var(--color-background-dark)] flex flex-col">
      <Navbar />

      {showCancelDialog && (
        <ConfirmDialog
          title="Cancel Subscription?"
          message="You will lose access to all premium features at the end of your current billing period. This action cannot be undone."
          confirmLabel="Yes, Cancel It"
          isDanger
          onConfirm={handleCancelConfirm}
          onCancel={() => setShowCancelDialog(false)}
        />
      )}

      <main className="flex-1 max-w-3xl mx-auto px-6 pt-32 pb-24 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Subscription</h1>
            <p className="text-gray-400 text-sm mt-1">View and manage your current billing plan.</p>
          </div>
          <Link
            to="/plans"
            className="hidden sm:flex items-center h-9 px-4 rounded-md border border-[#272b3a] text-sm text-gray-300 hover:bg-[#1a1d26] hover:text-white transition-all"
          >
            View Plans →
          </Link>
        </div>

        {isLoading ? (
          <ManageSubscriptionSkeleton />
        ) : !subscription ? (
          /* No subscription */
          <div className="text-center py-16 px-8 rounded-2xl bg-[#111111] border border-[#272b3a]">
            <div className="w-16 h-16 mx-auto bg-[#1a1d26] border border-[#272b3a] rounded-full flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No Active Subscription</h2>
            <p className="text-gray-400 text-sm mb-6">You are on the free plan. Upgrade to access premium features.</p>
            <button
              onClick={() => navigate('/plans')}
              className="px-8 py-2.5 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-all hover:shadow-[0_0_20px_rgba(45,95,255,0.4)]"
            >
              View Plans
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Status banners */}
            {isExpired && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
                <span>⚠️</span>
                <span>Your subscription has expired. Renew to regain premium access.</span>
              </div>
            )}
            {isActiveCancelled && (
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm flex items-center gap-3">
                <span>ℹ️</span>
                <span>
                  Your subscription is cancelled but you retain full access until{' '}
                  <strong>{formatDate(subscription.endDate)}</strong>.
                </span>
              </div>
            )}

            {/* Plan Card */}
            <div className="p-6 md:p-8 rounded-2xl bg-[#111111] border border-[#272b3a]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Current Plan</p>
                  <h2 className="text-2xl font-bold text-white">{planName}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    ₹{planPrice} / {planCycle}
                  </p>
                </div>
                <SubscriptionStatusBadge status={subscription.status} endDate={subscription.endDate} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#272b3a]">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1.5">Started On</p>
                  <p className="text-white font-medium">{formatDate(subscription.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1.5">
                    {isCancelled || isExpired ? 'Access Ends' : 'Next Billing Date'}
                  </p>
                  <p className="text-white font-medium">{formatDate(subscription.endDate)}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/plans"
                className="flex-1 flex justify-center items-center h-11 rounded-lg bg-[#1a1d26] hover:bg-[#272b3a] text-white border border-[#272b3a] transition-all font-semibold text-sm"
              >
                {isExpired ? 'Renew Plan' : 'Change Plan'}
              </Link>

              {/* Cancel only visible for active subscriptions (not already cancelled) */}
              {isActive && (
                <button
                  onClick={() => setShowCancelDialog(true)}
                  className="flex-1 h-11 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all font-semibold text-sm"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageSubscriptionPage;
