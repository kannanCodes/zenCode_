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
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage';
import SessionMonitoringPage from '../features/admin/pages/SessionMonitoringPage';
import SessionDetailsPage from '../features/admin/pages/SessionDetailsPage';
import MentorLoginPage from '../features/mentor/pages/MentorLoginPage';
import MentorActivationPage from '../features/mentor/pages/MentorActivationPage';
import MentorSuccessPage from '../features/mentor/pages/MentorSuccessPage';
import MentorLayout from '../features/mentor/components/MentorLayout';
import MentorAvailabilityPage from '../features/mentor/pages/MentorAvailabilityPage';
import MentorBookingsPage from '../features/mentor/pages/MentorBookingsPage';
import MentorDashboardPage from '../features/mentor/pages/MentorDashboardPage';
import SessionRoomPage from '../features/mentor/pages/SessionRoomPage';
import MentorProfilePage from '../features/mentor/pages/MentorProfilePage';
import AdminProblemListPage from '../features/admin/pages/ProblemListPage';
import ProblemFormPage from '../features/admin/pages/ProblemForm';
import PlanManagementPage from '../features/admin/pages/PlanManagementPage';
import Navbar from '../shared/components/Navbar';

// Candidate Mentoring Pages
import MentorsListPage from '../features/candidate/pages/MentorsListPage';
import CandidateMentorProfilePage from '../features/candidate/pages/MentorProfilePage';
import StudentBookingsPage from '../features/candidate/pages/StudentBookingsPage';
import StudentSessionRoomPage from '../features/candidate/pages/StudentSessionRoomPage';

import ProtectedRoute from '../shared/components/ProtectedRoute';


// Subscription Pages
import PlansPage from '../features/subscription/pages/PlansPage';
import PaymentSuccessPage from '../features/subscription/pages/PaymentSuccessPage';
import PaymentCancelPage from '../features/subscription/pages/PaymentCancelPage';
import ManageSubscriptionPage from '../features/subscription/pages/ManageSubscriptionPage';

// Notification Page
import NotificationsPage from '../features/notification/pages/NotificationsPage';

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

      {/* Notification Routes */}
      <Route path="/notifications" element={<ProtectedRoute><><Navbar /><NotificationsPage /></></ProtectedRoute>} />

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

      {/* Candidate / Mentoring Routes */}
      <Route
        path="/candidate/mentors"
        element={
          <ProtectedRoute>
            <MentorsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/mentors/:mentorId"
        element={
          <ProtectedRoute>
            <CandidateMentorProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/bookings"
        element={
          <ProtectedRoute>
            <StudentBookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/session/:roomId"
        element={
          <ProtectedRoute>
            <StudentSessionRoomPage />
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
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute redirectTo="/admin/login">
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
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
        path="/admin/sessions"
        element={
          <ProtectedRoute redirectTo="/admin/login">
            <SessionMonitoringPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sessions/:id"
        element={
          <ProtectedRoute redirectTo="/admin/login">
            <SessionDetailsPage />
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
        path="/mentor"
        element={
          <ProtectedRoute redirectTo="/mentor/login">
            <MentorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<MentorDashboardPage />} />
        <Route path="availability" element={<MentorAvailabilityPage />} />
        <Route path="bookings" element={<MentorBookingsPage />} />
        <Route path="profile" element={<MentorProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
      
      {/* Mentor Session (Outside layout, full screen) */}
      <Route
        path="/mentor/session/:roomId"
        element={
          <ProtectedRoute redirectTo="/mentor/login">
            <SessionRoomPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
