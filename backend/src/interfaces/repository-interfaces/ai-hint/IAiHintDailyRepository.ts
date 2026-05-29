import { IAiHintDailyUsageDocument } from '../../../infrastructure/database/models/ai-hint-daily-usage.model';
import { BaseRepository } from '../../../infrastructure/database/repositories/base/base.repository';

export interface IAiHintDailyRepository extends BaseRepository<IAiHintDailyUsageDocument> {
  getDailyCount(userId: string, date: string): Promise<number>;
  incrementDaily(userId: string, date: string): Promise<void>;
}
