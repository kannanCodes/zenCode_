import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './store';
import { fetchSubscription } from './store/slices/subscriptionSlice';
import { fetchUnreadCount } from './store/slices/notificationSlice';
import { tokenService } from './shared/lib/token';
import { notificationSocketManager } from './shared/lib/notificationSocket';
import AppRoutes from './routes/AppRoutes';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  // ── On mount: hydrate state if user is already logged in ──────────────────
  useEffect(() => {
    if (tokenService.getAccessToken()) {
      dispatch(fetchSubscription());
      dispatch(fetchUnreadCount());
      notificationSocketManager.connect();
    }
  }, [dispatch]);

  // ── On tab focus: re-sync subscription (handles Stripe redirect edge cases) ─
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && tokenService.getAccessToken()) {
        dispatch(fetchSubscription());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;