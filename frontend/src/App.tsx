import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './store';
import { fetchSubscription } from './store/slices/subscriptionSlice';
import { tokenService } from './shared/lib/token';
import AppRoutes from './routes/AppRoutes';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // If user is logged in on app load, hydrate subscription state
    if (tokenService.getAccessToken()) {
      dispatch(fetchSubscription());
    }
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;