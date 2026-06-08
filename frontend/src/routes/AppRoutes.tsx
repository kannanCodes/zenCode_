import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// ── Lazy-loaded pages (each becomes a separate JS chunk) ─────────────────────
// User Auth
const LandingPage              = lazy(() => import('../features/user/pages/LandingPage'));
const RegisterPage             = lazy(() => import('../features/user/pages/RegisterPage'));
const OTPVerificationPage      = lazy(() => import('../features/user/pages/OTPVerificationPage'));
const LoginPage                = lazy(() => import('../features/user/pages/LoginPage'));
const GoogleCallbackPage       = lazy(() => import('../features/user/pages/GoogleCallbackPage'));
const ForgotPasswordPage       = lazy(() => import('../features/user/pages/ForgotPasswordPage'));
const ResetPasswordPage        = lazy(() => import('../features/user/pages/ResetPasswordPage'));

// Candidate
const ProblemListPage          = lazy(() => import('../features/candidate/pages/ProblemListPage'));
const ProblemDetailPage        = lazy(() => import('../features/candidate/pages/ProblemDetailPage'));
const SubmissionsPage          = lazy(() => import('../features/candidate/pages/SubmissionsPage'));
const DashboardPage            = lazy(() => import('../features/candidate/pages/DashboardPage'));
const MentorsListPage          = lazy(() => import('../features/candidate/pages/MentorsListPage'));
const CandidateMentorProfilePage = lazy(() => import('../features/candidate/pages/MentorProfilePage'));
const StudentBookingsPage      = lazy(() => import('../features/candidate/pages/StudentBookingsPage'));
const StudentSessionRoomPage   = lazy(() => import('../features/candidate/pages/StudentSessionRoomPage'));

// Admin
const AdminLoginPage           = lazy(() => import('../features/admin/pages/AdminLoginPage'));
const AdminDashboardPage       = lazy(() => import('../features/admin/pages/AdminDashboardPage'));
const MentorManagementPage     = lazy(() => import('../features/admin/pages/MentorManagementPage'));
const UserManagementPage       = lazy(() => import('../features/admin/pages/UserManagementPage'));
const SessionMonitoringPage    = lazy(() => import('../features/admin/pages/SessionMonitoringPage'));
const SessionDetailsPage       = lazy(() => import('../features/admin/pages/SessionDetailsPage'));
const RevenueMonitoringPage    = lazy(() => import('../features/admin/pages/RevenueMonitoringPage'));
const AdminProblemListPage     = lazy(() => import('../features/admin/pages/ProblemListPage'));
const ProblemFormPage          = lazy(() => import('../features/admin/pages/ProblemForm'));
const PlanManagementPage       = lazy(() => import('../features/admin/pages/PlanManagementPage'));

// Mentor
const MentorLoginPage          = lazy(() => import('../features/mentor/pages/MentorLoginPage'));
const MentorActivationPage     = lazy(() => import('../features/mentor/pages/MentorActivationPage'));
const MentorSuccessPage        = lazy(() => import('../features/mentor/pages/MentorSuccessPage'));
const MentorForgotPasswordPage = lazy(() => import('../features/mentor/pages/MentorForgotPasswordPage'));
const MentorResetPasswordPage  = lazy(() => import('../features/mentor/pages/MentorResetPasswordPage'));
const MentorAvailabilityPage   = lazy(() => import('../features/mentor/pages/MentorAvailabilityPage'));
const MentorBookingsPage       = lazy(() => import('../features/mentor/pages/MentorBookingsPage'));
const MentorDashboardPage      = lazy(() => import('../features/mentor/pages/MentorDashboardPage'));
const SessionRoomPage          = lazy(() => import('../features/mentor/pages/SessionRoomPage'));
const MentorProfilePage        = lazy(() => import('../features/mentor/pages/MentorProfilePage'));
import MentorLayout from '../features/mentor/components/MentorLayout'; // not lazy — shared layout

// Subscription
const PlansPage                = lazy(() => import('../features/subscription/pages/PlansPage'));
const PaymentSuccessPage       = lazy(() => import('../features/subscription/pages/PaymentSuccessPage'));
const PaymentCancelPage        = lazy(() => import('../features/subscription/pages/PaymentCancelPage'));
const ManageSubscriptionPage   = lazy(() => import('../features/subscription/pages/ManageSubscriptionPage'));

const NotFoundPage             = lazy(() => import('../features/user/pages/NotFoundPage'));

import ProtectedRoute from '../shared/components/ProtectedRoute';

// ── Page-load spinner shown while lazy chunks are fetching ───────────────────
const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-[#2a2d3a] border-t-[var(--color-primary)] rounded-full animate-spin" />
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
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
        <Route path="/plans" element={<ProtectedRoute allowedRoles={['candidate']}><PlansPage /></ProtectedRoute>} />
        <Route path="/payment/success" element={<ProtectedRoute allowedRoles={['candidate']}><PaymentSuccessPage /></ProtectedRoute>} />
        <Route path="/payment/cancel" element={<ProtectedRoute allowedRoles={['candidate']}><PaymentCancelPage /></ProtectedRoute>} />
        <Route path="/subscription/manage" element={<ProtectedRoute allowedRoles={['candidate']}><ManageSubscriptionPage /></ProtectedRoute>} />

        {/* User Dashboard */}
        <Route path="/problems" element={<ProtectedRoute allowedRoles={['candidate']}><ProblemListPage /></ProtectedRoute>} />
        <Route path="/problems/:id" element={<ProtectedRoute allowedRoles={['candidate']}><ProblemDetailPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['candidate']}><DashboardPage /></ProtectedRoute>} />
        <Route path="/submissions" element={<ProtectedRoute allowedRoles={['candidate']}><SubmissionsPage /></ProtectedRoute>} />

        {/* Candidate / Mentoring Routes */}
        <Route path="/candidate/mentors" element={<ProtectedRoute allowedRoles={['candidate']}><MentorsListPage /></ProtectedRoute>} />
        <Route path="/candidate/mentors/:mentorId" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateMentorProfilePage /></ProtectedRoute>} />
        <Route path="/candidate/bookings" element={<ProtectedRoute allowedRoles={['candidate']}><StudentBookingsPage /></ProtectedRoute>} />
        <Route path="/candidate/session/:roomId" element={<ProtectedRoute allowedRoles={['candidate']}><StudentSessionRoomPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute redirectTo="/admin/login" allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/mentors" element={<ProtectedRoute redirectTo="/admin/login" allowedRoles={['admin']}><MentorManagementPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute redirectTo="/admin/login" allowedRoles={['admin']}><UserManagementPage /></ProtectedRoute>} />
        <Route path="/admin/problems" element={<ProtectedRoute redirectTo="/admin/login" allowedRoles={['admin']}><AdminProblemListPage /></ProtectedRoute>} />
        <Route path="/admin/problems/create" element={<ProtectedRoute redirectTo="/admin/login" allowedRoles={['admin']}><ProblemFormPage /></ProtectedRoute>} />
        <Route path="/admin/problems/edit/:id" element={<ProtectedRoute redirectTo="/admin/login" allowedRoles={['admin']}><ProblemFormPage /></ProtectedRoute>} />
        <Route path="/admin/sessions" element={<ProtectedRoute redirectTo="/admin/login" allowedRoles={['admin']}><SessionMonitoringPage /></ProtectedRoute>} />
        <Route path="/admin/sessions/:id" element={<ProtectedRoute redirectTo="/admin/login" allowedRoles={['admin']}><SessionDetailsPage /></ProtectedRoute>} />
        <Route path="/admin/revenue" element={<ProtectedRoute redirectTo="/admin/login" allowedRoles={['admin']}><RevenueMonitoringPage /></ProtectedRoute>} />
        <Route path="/admin/plan-management" element={<ProtectedRoute redirectTo="/admin/login" allowedRoles={['admin']}><PlanManagementPage /></ProtectedRoute>} />

        {/* Mentor Routes */}
        <Route path="/mentor/login" element={<MentorLoginPage />} />
        <Route path="/mentor/forgot-password" element={<MentorForgotPasswordPage />} />
        <Route path="/mentor/reset-password" element={<MentorResetPasswordPage />} />
        <Route path="/mentor/activate" element={<MentorActivationPage />} />
        <Route path="/mentor/activation-success" element={<MentorSuccessPage />} />

        <Route path="/mentor" element={<ProtectedRoute redirectTo="/mentor/login" allowedRoles={['mentor']}><MentorLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<MentorDashboardPage />} />
          <Route path="availability" element={<MentorAvailabilityPage />} />
          <Route path="bookings" element={<MentorBookingsPage />} />
          <Route path="profile" element={<MentorProfilePage />} />
        </Route>

        {/* Mentor Session (Outside layout, full screen) */}
        <Route path="/mentor/session/:roomId" element={<ProtectedRoute redirectTo="/mentor/login" allowedRoles={['mentor']}><SessionRoomPage /></ProtectedRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
