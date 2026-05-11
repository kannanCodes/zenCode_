import { z } from "zod";

const exampleSchema = z.object({
  input: z.string().min(1),
  output: z.string().min(1),
  explanation: z.string().optional(),
});

const testCaseSchema = z.object({
  input: z.string().min(1),
  output: z.string().min(1),
  isHidden: z.boolean().optional(),
});

const parameterSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
});

const functionSignatureSchema = z.object({
  functionName: z.string().min(1),
  parameters: z.array(parameterSchema).default([]),
  returnType: z.string().min(1),
});

const starterCodeSchema = z.object({
  javascript: z.string().optional(),
  python: z.string().optional(),
  java: z.string().optional(),
  cpp: z.string().optional(),
  c: z.string().optional(),
  csharp: z.string().optional(),
  go: z.string().optional(),
  rust: z.string().optional(),
  typescript: z.string().optional(),
}).optional();

export const createProblemValidator = z.object({
  title: z.string().min(5).max(150),
  description: z.string().min(20),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.array(z.string().min(1)).min(1, "At least one problem tag is required"),
  companyTags: z.array(z.string()).optional(),
  constraints: z.string().optional(),
  examples: z.array(exampleSchema).optional(),
  starterCode: starterCodeSchema,
  functionSignature: functionSignatureSchema,
  testCases: z.array(testCaseSchema).min(1),
  supportedLanguages: z.array(z.string()).optional(),
  isPremium: z.boolean().optional(),
});

export const updateProblemValidator = z.object({
  title: z.string().min(5).max(150).optional(),
  description: z.string().min(20).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  tags: z.array(z.string()).optional(),
  companyTags: z.array(z.string()).optional(),
  constraints: z.string().optional(),
  examples: z.array(exampleSchema).optional(),
  starterCode: starterCodeSchema,
  functionSignature: functionSignatureSchema.optional(),
  testCases: z.array(testCaseSchema).min(1).optional(),
  supportedLanguages: z.array(z.string()).optional(),
  isPremium: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
