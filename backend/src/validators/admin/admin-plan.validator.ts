import { z } from 'zod';
import { VALIDATION_MESSAGES } from '../../constants/messages';

const featureSchema = z.object({
  name: z.string().min(1, VALIDATION_MESSAGES.FEATURE_NAME_REQUIRED),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
});

const accessSchema = z.object({
  mentorBooking: z.boolean().default(false),
  premiumProblems: z.boolean().default(false),
  aiHints: z.boolean().default(false),
});

const updateAccessSchema = z.object({
  mentorBooking: z.boolean().optional(),
  premiumProblems: z.boolean().optional(),
  aiHints: z.boolean().optional(),
});

export const createPlanValidator = z.object({
  name: z.string().min(3, VALIDATION_MESSAGES.PLAN_NAME_MIN),
  price: z.number().min(0, VALIDATION_MESSAGES.PRICE_NON_NEGATIVE),
  billingCycle: z.enum(['monthly', 'yearly'], {
    message: VALIDATION_MESSAGES.BILLING_CYCLE_INVALID,
  }),
  intervalCount: z.number().min(1).default(1),
  description: z.string().min(10, VALIDATION_MESSAGES.PLAN_DESCRIPTION_MIN),
  features: z.array(featureSchema).min(1, VALIDATION_MESSAGES.FEATURE_REQUIRED),
  access: accessSchema,
  stripeProductId: z.string().optional().default(''),
  stripePriceId: z.string().optional().default(''),
});

export const updatePlanValidator = z.object({
  name: z.string().min(3).optional(),
  price: z.number().min(0).optional(),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
  intervalCount: z.number().min(1).optional(),
  description: z.string().min(10).optional(),
  features: z.array(featureSchema).optional(),
  access: updateAccessSchema.optional(),
  stripeProductId: z.string().optional(),
  stripePriceId: z.string().optional(),
  isActive: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});
