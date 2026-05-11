import { z } from 'zod';

export const createMentorSchema = z.object({
  fullName: z.string().trim().min(3),
  email: z.string().email(),
  expertise: z.array(z.string().trim()).min(1),
  experienceLevel: z.enum(['junior', 'mid', 'senior']),
});

export const listMentorsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(['INVITED', 'ACTIVE', 'DISABLED']).optional(),
  experienceLevel: z.enum(['junior', 'mid', 'senior']).optional(),
  isBlocked: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  expertise: z.string().trim().optional(),
  search: z.string().trim().max(100).optional(),
  sortBy: z
    .enum(['createdAt', 'invitedAt', 'activatedAt', 'experienceLevel', 'mentorStatus'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
