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
import problemRoutes from './routes/problem/problem.routes';
import compilerRoutes from './routes/compiler/compiler.routes';
import adminPlanRoutes from './routes/admin/AdminPlanRoutes';
import paymentRoutes from './routes/payments/payment.routes';
import subscriptionRoutes from './routes/payments/subscription.routes';
import submissionRoutes from './routes/problem/submission.routes';
import { webhookController } from './shared/di/payment.container';
import { appConfig } from './config/appConfig';
export const app = express();

app.use(cors({
  origin: [appConfig.frontendUrl],
  credentials: true,
}));

// ─── Webhooks (Must be before body parsers) ───────────────────────────────
// Stripe requires the raw body to verify signature
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  webhookController.stripeWebhookHandler(req as any, res as any);
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
app.use('/api/plans', adminPlanRoutes);
app.use('/api/mentor/auth', mentorAuthRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/compiler', compilerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/submissions', submissionRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: appConfig.nodeEnv });
});


app.use(errorMiddleware);