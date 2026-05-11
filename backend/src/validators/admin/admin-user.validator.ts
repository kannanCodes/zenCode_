import { z } from 'zod';

export const listUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  search: z.string().optional(),
  isBlocked: z
    .enum(['true', 'false'])
    .transform(v => v === 'true')
    .optional(),
  sortBy: z
    .enum(['createdAt', 'lastActiveDate', 'email'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
