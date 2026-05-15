import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../features/user/pages/LandingPage';
import ProblemListPage from '../features/candidate/pages/ProblemListPage';
import ProblemDetailPage from '../features/candidate/pages/ProblemDetailPage';
import SubmissionsPage from '../features/candidate/pages/SubmissionsPage';
import RegisterPage from '../features/user/pages/RegisterPage';
import OTPVerificationPage from '../features/user/pages/OTPVerificationPage';
import LoginPage from '../features/user/pages/LoginPage';
import GoogleCallbackPage from '../features/user/pages/GoogleCallbackPage';
import ForgotPasswordPage from '../features/user/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/user/pages/ResetPasswordPage';
import AdminLoginPage from '../features/admin/pages/AdminLoginPage';
import MentorManagementPage from '../features/admin/pages/MentorManagementPage';
import UserManagementPage from '../features/admin/pages/UserManagementPage'; 
import MentorLoginPage from '../features/mentor/pages/MentorLoginPage';
import MentorActivationPage from '../features/mentor/pages/MentorActivationPage';
import MentorSuccessPage from '../features/mentor/pages/MentorSuccessPage';
import AdminProblemListPage from '../features/admin/pages/ProblemListPage';
import ProblemFormPage from '../features/admin/pages/ProblemForm';
import PlanManagementPage from '../features/admin/pages/PlanManagementPage';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import { tokenService } from '../shared/lib/token';

// Subscription Pages
import PlansPage from '../features/subscription/pages/PlansPage';
import PaymentSuccessPage from '../features/subscription/pages/PaymentSuccessPage';
import PaymentCancelPage from '../features/subscription/pages/PaymentCancelPage';
import ManageSubscriptionPage from '../features/subscription/pages/ManageSubscriptionPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public - User Auth */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<OTPVerificationPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/google/success" element={<GoogleCallbackPage />} />

      {/* Subscription Routes */}
      <Route path="/plans" element={<ProtectedRoute><PlansPage /></ProtectedRoute>} />
      <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
      <Route path="/payment/cancel" element={<ProtectedRoute><PaymentCancelPage /></ProtectedRoute>} />
      <Route path="/subscription/manage" element={<ProtectedRoute><ManageSubscriptionPage /></ProtectedRoute>} />

      {/* User Dashboard */}
      <Route
        path="/problems"
        element={
          <ProtectedRoute>
            <ProblemListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/problems/:id"
        element={
          <ProtectedRoute>
            <ProblemDetailPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Navigate to="/problems" replace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/submissions"
        element={
          <ProtectedRoute>
            <SubmissionsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin/mentors"
        element={
          <ProtectedRoute redirectTo="/admin/login">
            <MentorManagementPage />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/dashboard" element={<Navigate to="/admin/mentors" replace />} />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute redirectTo="/admin/login">
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/problems"
        element={
          <ProtectedRoute redirectTo="/admin/login">
            <AdminProblemListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/problems/create"
        element={
          <ProtectedRoute redirectTo="/admin/login">
            <ProblemFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/problems/edit/:id"
        element={
          <ProtectedRoute redirectTo="/admin/login">
            <ProblemFormPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/admin/plan-management" 
        element={
          <ProtectedRoute redirectTo="/admin/login">
            <PlanManagementPage />
          </ProtectedRoute>
        } 
      />

      {/* Mentor Routes */}
      <Route path="/mentor/login" element={<MentorLoginPage />} />
      <Route path="/mentor/activate" element={<MentorActivationPage />} />
      <Route path="/mentor/activation-success" element={<MentorSuccessPage />} />
      <Route
        path="/mentor/dashboard"
        element={
          <ProtectedRoute redirectTo="/mentor/login">
            <div className="min-h-screen bg-[var(--color-background-dark)] flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-white text-4xl font-bold mb-4">Mentor Dashboard</h1>
                <p className="text-gray-400 mb-8">Welcome, Mentor! 🎉</p>
                <button
                  onClick={() => {
                    tokenService.clear();
                    window.location.href = '/mentor/login';
                  }}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;