import { IAiHintUsageDocument } from '../../../infrastructure/database/models/ai-hint-usage.model';
import { BaseRepository } from '../../../infrastructure/database/repositories/base/base.repository';

export interface IAiHintRepository extends BaseRepository<IAiHintUsageDocument> {
  findUsage(userId: string, problemId: string): Promise<IAiHintUsageDocument | null>;
  incrementAndSave(
    userId: string,
    problemId: string,
    hint: string,
    model: string,
    responseTimeMs: number
  ): Promise<IAiHintUsageDocument>;
}
