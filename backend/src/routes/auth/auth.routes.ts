import { Router } from 'express';
import passport from '../../config/passport';
import { authController } from "../../shared/di/auth.container";
import { cacheService } from "../../shared/di/shared.container";
import { validateRequest } from '../../middlewares/validate.middleware';
import { rateLimiter } from '../../middlewares/rateLimit.middleware';

import {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../../validators/auth.validator';

const router = Router();

router.post(
  '/register',
  rateLimiter(cacheService, 5, 3600), // 5 requests per hour for registration
  validateRequest(registerSchema),
  authController.startRegistration.bind(authController),
);

router.post(
  '/verify-otp',
  rateLimiter(cacheService, 5, 300), // 5 requests per 5 min for OTP verification
  validateRequest(verifyOtpSchema),
  authController.verifyRegistration.bind(authController),
);

router.post(
  '/resend-otp',
  validateRequest(resendOtpSchema),
  authController.resendOTP.bind(authController),
);

router.post(
  '/login',
  rateLimiter(cacheService, 10, 60), // 10 requests per minute for login
  validateRequest(loginSchema),
  authController.login.bind(authController),
);

router.post('/refresh', authController.refresh.bind(authController));

router.post('/logout', authController.logout.bind(authController));

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.googleCallback.bind(authController),
);

router.post(
  '/forgot-password',
  rateLimiter(cacheService, 3, 3600), // 3 requests per hour for forgot password
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword.bind(authController),
);

router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  authController.resetPassword.bind(authController),
);

router.get('/reset-password/validate', authController.validateResetToken.bind(authController));

export default router;