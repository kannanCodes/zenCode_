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
