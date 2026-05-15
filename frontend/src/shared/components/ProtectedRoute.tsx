import { Navigate } from 'react-router-dom';
import { tokenService } from '../lib/token';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute = ({ children, redirectTo = '/login' }: ProtectedRouteProps) => {
  if (!tokenService.getAccessToken()) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
