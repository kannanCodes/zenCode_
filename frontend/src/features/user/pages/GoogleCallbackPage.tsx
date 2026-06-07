import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { tokenService } from '../../../shared/lib/token';
import { showSuccess, showError } from '../../../shared/utils/toast.util';
import { fetchSubscription } from '../../../store/slices/subscriptionSlice';
import { fetchUnreadCount } from '../../../store/slices/notificationSlice';
import { notificationSocketManager } from '../../../shared/lib/notificationSocket';
import type { AppDispatch } from '../../../store';

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();

  const isProcessedKey = useRef(false);

  useEffect(() => {
    if (isProcessedKey.current) return;
    isProcessedKey.current = true;

    const token = searchParams.get('token');

    if (token) {
      tokenService.setAccessToken(token);

      // Hydrate subscription + notifications immediately (no refresh needed)
      dispatch(fetchSubscription());
      dispatch(fetchUnreadCount());
      notificationSocketManager.connect();

      showSuccess('Login successful');
      navigate('/dashboard', { replace: true });
    } else {
      showError('Google authentication failed');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen bg-[var(--color-background-dark)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing Google Sign In...</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;