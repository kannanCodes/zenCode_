import { z } from "zod";
import { SLOT_MESSAGES } from "../../constants/messages";

export const getSlotsValidator = z.object({
  date: z.string().min(1).optional(),
  startDate: z.string().min(1, SLOT_MESSAGES.START_DATE_REQUIRED).optional(),
  endDate: z.string().min(1, SLOT_MESSAGES.END_DATE_REQUIRED).optional(),
}).refine((query) => query.date || (query.startDate && query.endDate), {
  message: SLOT_MESSAGES.START_DATE_REQUIRED,
});
