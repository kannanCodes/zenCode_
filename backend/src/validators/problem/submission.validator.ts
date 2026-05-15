import { z } from "zod";

export const createSubmissionSchema = z.object({
  problemId: z.string().min(1, "Problem ID is required"),
  language: z.enum(["python", "javascript"]),
  sourceCode: z.string().min(1, "Source code is required"),
});
