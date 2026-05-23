import { z } from 'zod';
import { LANGUAGE_IDS } from '../../constants/compiler.constants';
import { VALIDATION_MESSAGES } from '../../constants/messages';

const supportedLanguages = Object.keys(LANGUAGE_IDS) as [string, ...string[]];

export const executeCodeValidator = z.object({
  language: z.enum(supportedLanguages, {
    message: VALIDATION_MESSAGES.INVALID_LANGUAGE,
  }),
  sourceCode: z.string().min(1, VALIDATION_MESSAGES.SOURCE_CODE_REQUIRED).max(50000, VALIDATION_MESSAGES.CODE_TOO_LARGE),
  stdin: z.string().max(10000, VALIDATION_MESSAGES.INPUT_TOO_LARGE).optional(),
  problemId: z.string().optional(),
  isSubmission: z.boolean().optional(),
});

export type ExecuteCodeValidatorType = z.infer<typeof executeCodeValidator>;
