import { z } from 'zod';
import { LANGUAGE_IDS } from '../../constants/compiler.constants';

const supportedLanguages = Object.keys(LANGUAGE_IDS) as [string, ...string[]];

export const executeCodeValidator = z.object({
  language: z.enum(supportedLanguages, {
    message: 'Invalid language',
  }),
  sourceCode: z.string().min(1, 'Source code is required').max(50000, 'Code too large'),
  stdin: z.string().max(10000, 'Input too large').optional(),
  problemId: z.string().optional(),
  isSubmission: z.boolean().optional(),
});

export type ExecuteCodeValidatorType = z.infer<typeof executeCodeValidator>;
