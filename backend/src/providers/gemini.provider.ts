import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAiProvider } from '../interfaces/providers/IAiProvider';
import { AI_HINT, AI_HINT_MESSAGES } from '../constants/ai-hint.constants';
import { AppError } from '../shared/utils/AppError';
import { STATUS_CODES } from '../shared/constants/status';
import { logger } from '../shared/utils/Logger';

export class GeminiProvider implements IAiProvider {
  private readonly client: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({
        model: AI_HINT.MODEL,
        generationConfig: {
          temperature: AI_HINT.TEMPERATURE,
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (!text || !text.trim()) {
        throw new AppError(AI_HINT_MESSAGES.AI_UNAVAILABLE, STATUS_CODES.INTERNAL_SERVER_ERROR);
      }

      return text.trim();
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      logger.error('GeminiProvider.generateText failed:', error);
      throw new AppError(AI_HINT_MESSAGES.AI_UNAVAILABLE, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}
