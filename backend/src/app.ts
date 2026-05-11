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
import { appConfig } from './config/appConfig';

export const app = express();

app.use(cors({
  origin: [appConfig.frontendUrl],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminUserRoutes);
app.use('/api/admin', adminMentorRoutes);
app.use('/api/mentor/auth', mentorAuthRoutes);
app.use('/api/problems', problemRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: appConfig.nodeEnv });
});


app.use(errorMiddleware);