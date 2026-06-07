export const AI_HINT = {
  MAX_PER_PROBLEM: parseInt(process.env.AI_HINT_MAX_PER_PROBLEM ?? '3', 10),
  MAX_DAILY: parseInt(process.env.AI_HINT_MAX_DAILY ?? '10', 10),
  COOLDOWN_SECONDS: parseInt(process.env.AI_HINT_COOLDOWN_SECONDS ?? '10', 10),
  MAX_OUTPUT_TOKENS: 120,
  TEMPERATURE: 0.4,
  MODEL: process.env.AI_MODEL ?? 'gemini-1.5-flash',
  COOLDOWN_CACHE_PREFIX: 'ai_hint_cooldown:',
  MAX_HINT_OUTPUT_LENGTH: 500,
} as const;

export const AI_HINT_RATE_LIMITER = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 30,
  MESSAGE: { success: false, message: 'Too many AI hint requests. Please wait 15 minutes before trying again.' },
} as const;

export const AI_HINT_MESSAGES = {
  PREMIUM_REQUIRED: 'AI Hints require an active premium subscription.',
  DAILY_LIMIT_REACHED: `You have reached your daily AI hint limit (10/day). Try again tomorrow.`,
  PROBLEM_LIMIT_REACHED: 'You have used all 3 hints for this problem.',
  COOLDOWN_ACTIVE: 'Please wait a moment before requesting another hint.',
  AI_UNAVAILABLE: 'AI hint service is temporarily unavailable. Please try again.',
  INVALID_OUTPUT: 'AI returned an unsafe or unusable response. Please try again.',
} as const;

export const PROMPT_INJECTION_PHRASES = [
  'ignore previous instructions',
  'give full code',
  'give exact solution',
  'bypass rules',
  'reveal the answer',
  'show me the solution',
  'what is the answer',
  'write the code for me',
] as const;

export const CODE_PATTERNS = /function\s*\(|class\s+\w+|return\s+\w|import\s+|def\s+\w+\s*\(|for\s*\(|while\s*\(/;
