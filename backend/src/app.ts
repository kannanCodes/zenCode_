import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from './config/passport';

import { errorMiddleware } from './middlewares/error.middleware';
import authRoutes from './routes/auth/auth.routes';
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

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: appConfig.nodeEnv });
});


app.use(errorMiddleware);