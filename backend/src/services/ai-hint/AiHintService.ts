import { IAiHintService } from '../../interfaces/service-interfaces/ai-hint/IAiHintService';
import { IAiHintRepository } from '../../interfaces/repository-interfaces/ai-hint/IAiHintRepository';
import { IAiHintDailyRepository } from '../../interfaces/repository-interfaces/ai-hint/IAiHintDailyRepository';
import { IAiProvider } from '../../interfaces/providers/IAiProvider';
import { IProblemRepository } from '../../interfaces/repository-interfaces/problem/IProblemRepository';
import { ICacheService } from '../../interfaces/service-interfaces/auth/ICacheService';
import { AiHintResponseDto } from '../../dtos/ai-hint/ai-hint.dto';
import { AI_HINT, AI_HINT_MESSAGES } from '../../constants/ai-hint.constants';
import { PROBLEM_MESSAGES } from '../../constants/messages';
import { buildHintPrompt } from '../../prompts/hint.prompt';
import { sanitizePromptInput, validateHintOutput } from '../../utils/ai-hint.utils';
import { AppError } from '../../shared/utils/AppError';
import { STATUS_CODES } from '../../shared/constants/status';
import { logger } from '../../shared/utils/Logger';

export class AiHintService implements IAiHintService {
  constructor(
    private readonly hintRepo: IAiHintRepository,
    private readonly dailyRepo: IAiHintDailyRepository,
    private readonly aiProvider: IAiProvider,
    private readonly problemRepo: IProblemRepository,
    private readonly cacheService: ICacheService
  ) {}

  async getStatus(userId: string, problemId: string): Promise<import('../../dtos/ai-hint/ai-hint.dto').AiHintStatusDto> {
    const today = new Date().toISOString().substring(0, 10);
    
    // Fetch parallel
    const [usage, dailyCount, ttl] = await Promise.all([
      this.hintRepo.findUsage(userId, problemId),
      this.dailyRepo.getDailyCount(userId, today),
      this.cacheService.ttl(`${AI_HINT.COOLDOWN_CACHE_PREFIX}${userId}:${problemId}`)
    ]);

    const hintsUsed = usage?.hintsUsed ?? 0;
    const hints = usage?.generatedHints?.map(h => h.hint) ?? [];
    
    return {
      hints,
      remainingProblemHints: Math.max(0, AI_HINT.MAX_PER_PROBLEM - hintsUsed),
      remainingDailyHints: Math.max(0, AI_HINT.MAX_DAILY - dailyCount),
      cooldownRemainingSeconds: ttl > 0 ? ttl : 0
    };
  }

  async generateHint(userId: string, problemId: string): Promise<AiHintResponseDto> {
    // 1. Backend Redis cooldown check
    const cooldownKey = `${AI_HINT.COOLDOWN_CACHE_PREFIX}${userId}:${problemId}`;
    const cooldownActive = await this.cacheService.get<string>(cooldownKey);
    if (cooldownActive) {
      throw new AppError(AI_HINT_MESSAGES.COOLDOWN_ACTIVE, STATUS_CODES.TOO_MANY_REQUESTS);
    }

    // 2. Check daily limit
    const today = new Date().toISOString().substring(0, 10); // "YYYY-MM-DD"
    const dailyCount = await this.dailyRepo.getDailyCount(userId, today);
    if (dailyCount >= AI_HINT.MAX_DAILY) {
      throw new AppError(AI_HINT_MESSAGES.DAILY_LIMIT_REACHED, STATUS_CODES.TOO_MANY_REQUESTS);
    }

    // 3. Check per-problem limit
    const usage = await this.hintRepo.findUsage(userId, problemId);
    const hintsUsed = usage?.hintsUsed ?? 0;
    if (hintsUsed >= AI_HINT.MAX_PER_PROBLEM) {
      throw new AppError(AI_HINT_MESSAGES.PROBLEM_LIMIT_REACHED, STATUS_CODES.BAD_REQUEST);
    }

    // 4. Fetch problem
    const problem = await this.problemRepo.findById(problemId);
    if (!problem) {
      throw new AppError(PROBLEM_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    // 5. Sanitize problem content before injecting into prompt
    const safeDescription = sanitizePromptInput(problem.description ?? '');
    const safeConstraints = sanitizePromptInput(
      Array.isArray(problem.constraints) ? problem.constraints.join(', ') : (problem.constraints ?? '')
    );

    // 6. Build difficulty-aware progressive prompt
    const hintNumber = hintsUsed + 1;
    const prompt = buildHintPrompt(
      problem.title,
      safeDescription,
      safeConstraints,
      problem.difficulty,
      hintNumber
    );

    // 7. Generate hint via AI provider (GeminiProvider retries internally)
    const t0 = Date.now();
    let rawHint: string;
    try {
      rawHint = await this.aiProvider.generateText(prompt);
    } catch (error) {
      logger.error('AiHintService.generateHint: AI provider exhausted all retries', error);
      throw new AppError(AI_HINT_MESSAGES.AI_UNAVAILABLE, STATUS_CODES.SERVICE_UNAVAILABLE);
    }
    const responseTimeMs = Date.now() - t0;

    // 8. Validate AI output — reject if it contains code
    if (!validateHintOutput(rawHint)) {
      logger.warn(`AiHintService: Gemini returned unsafe output for problem ${problemId}`);
      throw new AppError(AI_HINT_MESSAGES.INVALID_OUTPUT, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    // 9. Persist usage + increment daily + set Redis cooldown — all in parallel
    await Promise.all([
      this.hintRepo.incrementAndSave(userId, problemId, rawHint, AI_HINT.MODEL, responseTimeMs),
      this.dailyRepo.incrementDaily(userId, today),
      this.cacheService.set(cooldownKey, '1', AI_HINT.COOLDOWN_SECONDS),
    ]);

    // 10. Return response with counters
    return {
      hint: rawHint,
      remainingProblemHints: AI_HINT.MAX_PER_PROBLEM - hintNumber,
      remainingDailyHints: AI_HINT.MAX_DAILY - (dailyCount + 1),
    };
  }
}
