import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from './config/passport';

import { errorMiddleware } from './middlewares/error.middleware';
import authRoutes from './routes/auth/auth.routes';
import adminAuthRoutes from './routes/admin/admin-auth.routes';
import adminUserRoutes from './routes/admin/admin-user.routes';
import adminMentorRoutes from './routes/admin/admin-mentor.routes';
import mentorAuthRoutes from './routes/mentor/mentor-auth.routes';
import mentorAvailabilityRoutes from './routes/mentor/mentor-availability.routes';
import mentorSlotRoutes from './routes/mentor/mentor-slot.routes';
import mentorBookingRoutes from './routes/mentor/mentor-booking.routes';
import mentorSessionRoutes from './routes/mentor/mentor-session.routes';
import mentorReviewRoutes from './routes/mentor/mentor-review.routes';
import mentorProfileRoutes from './routes/mentor/mentor-profile.routes';
import candidateMentorRoutes from './routes/candidate/candidate-mentor.routes';
import problemRoutes from './routes/problem/problem.routes';
import compilerRoutes from './routes/compiler/compiler.routes';
import adminPlanRoutes from './routes/admin/AdminPlanRoutes';
import paymentRoutes from './routes/payments/payment.routes';
import subscriptionRoutes from './routes/payments/subscription.routes';
import submissionRoutes from './routes/problem/submission.routes';
import messageRoutes from './routes/chat/message.routes';
import notificationRoutes from './routes/notification/notification.routes';
import { webhookController } from './shared/di/payment.container';
import { appConfig } from './config/appConfig';
import adminDashboardRoutes from './routes/admin/admin-dashboard.routes';
import adminSessionRoutes from './routes/admin/admin-session.routes';
import adminRevenueRoutes from './routes/admin/admin-revenue.routes';
export const app = express();

app.use(cors({
  origin: [appConfig.frontendUrl],
  credentials: true,
}));

// ─── Webhooks (Must be before body parsers) ───────────────────────────────
// Stripe requires the raw body to verify signature
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  webhookController.stripeWebhookHandler(req as unknown as express.Request, res as unknown as express.Response);
});

// ─── Global Middlewares ─────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminUserRoutes);
app.use('/api/admin', adminMentorRoutes);
app.use('/api/admin', adminDashboardRoutes);
app.use('/api/admin', adminSessionRoutes);
app.use('/api/admin/revenue', adminRevenueRoutes);
app.use('/api/plans', adminPlanRoutes);
app.use('/api/mentor/auth', mentorAuthRoutes);
app.use('/api/mentor/availability', mentorAvailabilityRoutes);
app.use('/api/mentor-slots', mentorSlotRoutes);
app.use('/api/mentor-bookings', mentorBookingRoutes);
app.use('/api/mentor-sessions', mentorSessionRoutes);
app.use('/api/mentor-reviews', mentorReviewRoutes);
app.use('/api/mentor/profile', mentorProfileRoutes);
app.use('/api/candidates/mentors', candidateMentorRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/compiler', compilerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: appConfig.nodeEnv });
});


app.use(errorMiddleware);
