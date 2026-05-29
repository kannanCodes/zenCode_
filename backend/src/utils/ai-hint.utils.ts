import {
  AI_HINT,
  PROMPT_INJECTION_PHRASES,
  CODE_PATTERNS,
} from '../constants/ai-hint.constants';

/**
 * Sanitize user-controlled input before including it in a Gemini prompt.
 * Strips prompt injection phrases, code fences, and excessive length.
 */
export function sanitizePromptInput(text: string): string {
  let sanitized = text;

  // Remove code fences
  sanitized = sanitized.replace(/```[\s\S]*?```/g, '[code removed]');
  sanitized = sanitized.replace(/`[^`]*`/g, '[code removed]');

  // Remove known injection phrases (case-insensitive)
  for (const phrase of PROMPT_INJECTION_PHRASES) {
    const regex = new RegExp(phrase, 'gi');
    sanitized = sanitized.replace(regex, '[removed]');
  }

  // Truncate to prevent oversized inputs
  if (sanitized.length > AI_HINT.MAX_HINT_OUTPUT_LENGTH) {
    sanitized = sanitized.substring(0, AI_HINT.MAX_HINT_OUTPUT_LENGTH) + '...';
  }

  return sanitized.trim();
}

/**
 * Validate the AI output before returning it to the user.
 * Returns false if the output contains code or is otherwise unsafe.
 */
export function validateHintOutput(hint: string): boolean {
  if (!hint || !hint.trim()) return false;

  // Reject code fences
  if (hint.includes('```')) return false;

  // Reject excessive length
  if (hint.length > AI_HINT.MAX_HINT_OUTPUT_LENGTH) return false;

  // Reject code patterns
  if (CODE_PATTERNS.test(hint)) return false;

  return true;
}
