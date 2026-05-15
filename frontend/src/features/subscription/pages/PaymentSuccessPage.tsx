import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store';
import { fetchSubscription } from '../../../store/slices/subscriptionSlice';
import { paymentService } from '../services/payment.service';
import Navbar from '../../../shared/components/Navbar';

/**
 * PaymentSuccessPage
 *
 * Fixes applied:
 * 1. Uses sessionStorage to mark a session_id as processed — prevents re-showing
 *    the success UI when the user navigates back to this URL.
 * 2. Uses navigate('/problems', { replace: true }) so the success URL is removed
 *    from browser history entirely — back button goes to plans, not success.
 * 3. useRef guard prevents double-invocation in React 18 Strict Mode.
 */
const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [isVerifying, setIsVerifying] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const hasRun = useRef(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // No session_id in URL — redirect away
    if (!sessionId) {
      navigate('/plans', { replace: true });
      return;
    }

    // Already processed this session (e.g. user pressed Back) — skip and redirect
    const storageKey = `zc_paid_${sessionId}`;
    if (sessionStorage.getItem(storageKey)) {
      navigate('/problems', { replace: true });
      return;
    }

    // Prevent double-run in React 18 Strict Mode
    if (hasRun.current) return;
    hasRun.current = true;

    // Mark as processed immediately so any re-mount skips this flow
    sessionStorage.setItem(storageKey, '1');

    const verifyAndSync = async () => {
      try {
        // Synchronously verify with backend instead of waiting for webhook
        await paymentService.verifySession(sessionId);
        await dispatch(fetchSubscription()).unwrap();
      } catch {
        // Fallback: If verification fails, webhook might still be processing.
        // We will still dispatch fetch in case it succeeded via webhook.
        await dispatch(fetchSubscription()).unwrap().catch(() => {});
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAndSync();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — run once on mount only

  // Countdown timer — starts after verification is done
  useEffect(() => {
    if (isVerifying) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/problems', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVerifying, navigate]);

  return (
    <div className="min-h-screen bg-[var(--color-background-dark)] flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {isVerifying ? (
          /* Verifying state */
          <div className="flex flex-col items-center gap-5">
            <div className="w-14 h-14 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin" />
            <div>
              <h2 className="text-xl font-bold text-white">Verifying Payment...</h2>
              <p className="text-gray-500 text-sm mt-1">Please do not close this page.</p>
            </div>
          </div>
        ) : (
          /* Success state */
          <div className="flex flex-col items-center gap-6 max-w-md w-full p-8 rounded-2xl bg-[#111111] border border-[#272b3a] shadow-2xl relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-60" />

            {/* Success icon */}
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                Welcome to Premium. Your account has been upgraded and all premium features are now unlocked.
              </p>
            </div>

            <div className="w-full h-px bg-[#272b3a]" />

            <p className="text-sm text-gray-500">
              Redirecting to dashboard in{' '}
              <span className="font-bold text-white tabular-nums">{countdown}</span>s...
            </p>

            <button
              id="go-to-dashboard-btn"
              onClick={() => navigate('/problems', { replace: true })}
              className="w-full h-12 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-all hover:shadow-[0_0_20px_rgba(45,95,255,0.4)]"
            >
              Go to Dashboard Now
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PaymentSuccessPage;
