import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const slotSchema = z.object({
  startTime: z.string().regex(timeRegex, "Invalid start time"),
  endTime: z.string().regex(timeRegex, "Invalid end time"),
});

export const upsertAvailabilityValidator = z.object({
  body: z.object({
    timezone: z.string().min(1),
    weeklyAvailability: z.object({
      monday: z.array(slotSchema).optional(),
      tuesday: z.array(slotSchema).optional(),
      wednesday: z.array(slotSchema).optional(),
      thursday: z.array(slotSchema).optional(),
      friday: z.array(slotSchema).optional(),
      saturday: z.array(slotSchema).optional(),
      sunday: z.array(slotSchema).optional(),
    }),
  }),
});
