import { z } from "zod";
import { SLOT_MESSAGES } from "../../constants/messages";

export const getSlotsValidator = z.object({
  query: z.object({
    startDate: z.string().min(1, SLOT_MESSAGES.START_DATE_REQUIRED),
    endDate: z.string().min(1, SLOT_MESSAGES.END_DATE_REQUIRED),
  }),
});
