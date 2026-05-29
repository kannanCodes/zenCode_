import { GeminiProvider } from '../../providers/gemini.provider';
import { AiHintRepository } from '../../repositories/ai-hint/AiHintRepository';
import { AiHintDailyRepository } from '../../repositories/ai-hint/AiHintDailyRepository';
import { AiHintService } from '../../services/ai-hint/AiHintService';
import { AiHintController } from '../../controllers/ai-hint/AiHintController';
import { IAiHintService } from '../../interfaces/service-interfaces/ai-hint/IAiHintService';
import { problemRepository } from './problem.container';
import { cacheService } from './shared.container';

// ── Providers ─────────────────────────────────────────────────────────────────
const geminiProvider = new GeminiProvider();

// ── Repositories ──────────────────────────────────────────────────────────────
const aiHintRepository = new AiHintRepository();
const aiHintDailyRepository = new AiHintDailyRepository();

// ── Services ──────────────────────────────────────────────────────────────────
export const aiHintService: IAiHintService = new AiHintService(
  aiHintRepository,
  aiHintDailyRepository,
  geminiProvider,
  problemRepository,
  cacheService
);

// ── Controller ────────────────────────────────────────────────────────────────
export const aiHintController = new AiHintController(aiHintService);
