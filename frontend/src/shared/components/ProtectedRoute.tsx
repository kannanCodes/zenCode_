import { Navigate } from 'react-router-dom';
import { tokenService } from '../lib/token';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, redirectTo = '/login', allowedRoles }: ProtectedRouteProps) => {
  const token = tokenService.getAccessToken();

  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check roles if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const payload = tokenService.getTokenPayload();
    const userRole = payload?.role as string;

    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on their actual role
      if (userRole === 'mentor') return <Navigate to="/mentor/dashboard" replace />;
      if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
      if (userRole === 'candidate') return <Navigate to="/dashboard" replace />;
      
      // Fallback
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
