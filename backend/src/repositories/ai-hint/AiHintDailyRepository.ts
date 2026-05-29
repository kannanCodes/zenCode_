import { Types } from 'mongoose';
import { AiHintDailyUsage, IAiHintDailyUsageDocument } from '../../infrastructure/database/models/ai-hint-daily-usage.model';
import { IAiHintDailyRepository } from '../../interfaces/repository-interfaces/ai-hint/IAiHintDailyRepository';
import { BaseRepository } from '../../infrastructure/database/repositories/base/base.repository';

export class AiHintDailyRepository extends BaseRepository<IAiHintDailyUsageDocument> implements IAiHintDailyRepository {
  constructor() {
    super(AiHintDailyUsage);
  }

  async getDailyCount(userId: string, date: string): Promise<number> {
    const doc = await this.model.findOne({
      userId: new Types.ObjectId(userId),
      date,
    }).exec();
    return doc?.count ?? 0;
  }

// Atomically increments the daily count with upsert.
// Uses $inc to prevent race conditions on concurrent requests.
  async incrementDaily(userId: string, date: string): Promise<void> {
    await this.model.updateOne(
      { userId: new Types.ObjectId(userId), date },
      { $inc: { count: 1 } },
      { upsert: true }
    ).exec();
  }
}
