import { z } from 'zod';
import { AUTH_MESSAGES, VALIDATION_MESSAGES } from '../../constants/messages';

export const registerSchema = z.object({
  email: z.string().email(VALIDATION_MESSAGES.VALID_EMAIL_REQUIRED),
  password: z.string().min(6, VALIDATION_MESSAGES.PASSWORD_MIN_6),
  fullName: z.string().min(2, VALIDATION_MESSAGES.FULL_NAME_MIN).max(50),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: AUTH_MESSAGES.PASSWORDS_DO_NOT_MATCH,
  path: ['confirmPassword'],
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, VALIDATION_MESSAGES.OTP_LENGTH).regex(/^\d+$/, VALIDATION_MESSAGES.OTP_NUMERIC),
});

export const resendOtpSchema = z.object({
  email: z.string().email(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6, VALIDATION_MESSAGES.PASSWORD_MIN_6),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: AUTH_MESSAGES.PASSWORDS_DO_NOT_MATCH,
  path: ['confirmPassword'],
});
