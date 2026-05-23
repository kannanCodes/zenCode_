import { z } from "zod";

export const createBookingValidator = z.object({
  mentorId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});
