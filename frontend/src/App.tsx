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

  useEffect(() => {
    if (tokenService.getAccessToken()) {
      // Hydrate subscription state
      dispatch(fetchSubscription());
      // Hydrate notification unread count
      dispatch(fetchUnreadCount());
      // Initialize persistent notification socket
      notificationSocketManager.connect();
    }
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;