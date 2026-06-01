import { z } from 'zod';
import { AUTH_MESSAGES, MENTOR_MESSAGES, VALIDATION_MESSAGES } from '../../constants/messages';

export const activateMentorSchema = z.object({
  token: z.string().min(1, VALIDATION_MESSAGES.TOKEN_REQUIRED),
  password: z.string().min(8, MENTOR_MESSAGES.PASSWORDS_MIN_LENGTH),
  confirmPassword: z.string().min(1, VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED),
}).refine((data) => data.password === data.confirmPassword, {
  message: AUTH_MESSAGES.PASSWORDS_DO_NOT_MATCH,
  path: ['confirmPassword'],
});

export const mentorLoginSchema = z.object({
  email: z.string().email(VALIDATION_MESSAGES.INVALID_EMAIL),
  password: z.string().min(1, VALIDATION_MESSAGES.PASSWORD_REQUIRED),
});

export const mentorForgotPasswordSchema = z.object({
  email: z.string().email(VALIDATION_MESSAGES.INVALID_EMAIL),
});

export const mentorResetPasswordSchema = z.object({
  token: z.string().min(1, VALIDATION_MESSAGES.TOKEN_REQUIRED),
  password: z.string().min(8, MENTOR_MESSAGES.PASSWORDS_MIN_LENGTH),
  confirmPassword: z.string().min(1, VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED),
}).refine((data) => data.password === data.confirmPassword, {
  message: AUTH_MESSAGES.PASSWORDS_DO_NOT_MATCH,
  path: ['confirmPassword'],
});

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required').regex(/^[a-f\d]{24}$/i, 'Invalid booking ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  feedback: z.string().min(10, 'Feedback must be at least 10 characters').max(1000, 'Feedback cannot exceed 1000 characters'),
  isPublic: z.boolean().optional(),
});
