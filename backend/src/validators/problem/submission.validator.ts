import { z } from "zod";
import { VALIDATION_MESSAGES } from "../../constants/messages";

export const createSubmissionSchema = z.object({
  problemId: z.string().min(1, VALIDATION_MESSAGES.PROBLEM_ID_REQUIRED),
  language: z.enum(["python", "javascript"]),
  sourceCode: z.string().min(1, VALIDATION_MESSAGES.SOURCE_CODE_REQUIRED),
});
