import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { IAiProvider } from '../interfaces/providers/IAiProvider';
import { AI_HINT, AI_HINT_MESSAGES } from '../constants/ai-hint.constants';
import { AppError } from '../shared/utils/AppError';
import { STATUS_CODES } from '../shared/constants/status';
import { logger } from '../shared/utils/Logger';

const RETRY_ATTEMPTS = 5;
const RETRY_BASE_DELAY_MS = 500; // 500ms → 1000ms → 2000ms → 4000ms

// Waits for `ms` milliseconds, with ±20% random jitter to spread retries
// and avoid a thundering-herd effect when multiple requests retry together.

function sleep(ms: number): Promise<void> {
  const jitter = ms * 0.2 * (Math.random() * 2 - 1); // ±20%
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms + jitter)));
}

// Returns true for errors that are worth retrying
// transient network issues, upstream rate-limits, or server-side 5xx from Gemini.
//AppErrors are domain errors (already classified) — never retry those.
function isRetriable(error: unknown): boolean {
  if (error instanceof AppError) return false;

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    // Gemini SDK surfaces these as plain Error messages
    if (msg.includes('fetch failed') || msg.includes('network') || msg.includes('timeout')) {
      return true;
    }
    // Gemini API rate-limit / server errors (status embedded in message or name)
    if (msg.includes('429') || msg.includes('503') || msg.includes('500') || msg.includes('rate')) {
      return true;
    }
  }

  return false; // default: do NOT retry unknown errors
}

export class GeminiProvider implements IAiProvider {
  private readonly client: GoogleGenerativeAI;
  private readonly model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.client = new GoogleGenerativeAI(apiKey);
    // Cache the model instance — no need to re-create on every request
    this.model = this.client.getGenerativeModel({
      model: AI_HINT.MODEL,
      generationConfig: {
        temperature: AI_HINT.TEMPERATURE,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });
  }

  async generateText(prompt: string): Promise<string> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const text = result.response.text();

        if (!text || !text.trim()) {
          throw new AppError(AI_HINT_MESSAGES.AI_UNAVAILABLE, STATUS_CODES.SERVICE_UNAVAILABLE);
        }

        if (attempt > 1) {
          logger.info(`GeminiProvider: succeeded on attempt ${attempt}`);
        }

        return text.trim();
      } catch (error: unknown) {
        // Domain errors (AppError) are final — do not retry
        if (error instanceof AppError) throw error;

        lastError = error;
        logger.warn(
          `GeminiProvider.generateText: attempt ${attempt}/${RETRY_ATTEMPTS} failed`,
          error
        );

        if (attempt < RETRY_ATTEMPTS && isRetriable(error)) {
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1); // 200, 400, 800
          logger.info(`GeminiProvider: retrying in ~${delay}ms (attempt ${attempt + 1}/${RETRY_ATTEMPTS})`);
          await sleep(delay);
        }
      }
    }

    // All attempts exhausted
    logger.error(
      `GeminiProvider.generateText: all ${RETRY_ATTEMPTS} attempts failed`,
      lastError
    );
    throw new AppError(AI_HINT_MESSAGES.AI_UNAVAILABLE, STATUS_CODES.SERVICE_UNAVAILABLE);
  }
}
