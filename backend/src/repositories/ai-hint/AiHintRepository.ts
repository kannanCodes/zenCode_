import { Types } from 'mongoose';
import { AiHintUsage, IAiHintUsageDocument } from '../../infrastructure/database/models/ai-hint-usage.model';
import { IAiHintRepository } from '../../interfaces/repository-interfaces/ai-hint/IAiHintRepository';
import { BaseRepository } from '../../infrastructure/database/repositories/base/base.repository';

export class AiHintRepository extends BaseRepository<IAiHintUsageDocument> implements IAiHintRepository {
  constructor() {
    super(AiHintUsage);
  }
  async findUsage(userId: string, problemId: string): Promise<IAiHintUsageDocument | null> {
    return this.model.findOne({
      userId: new Types.ObjectId(userId),
      problemId: new Types.ObjectId(problemId),
    }).exec();
  }

  // Atomically increments hintsUsed and appends the generated hint entry.
  //   Uses findOneAndUpdate with upsert to prevent race conditions.
  async incrementAndSave(
    userId: string,
    problemId: string,
    hint: string,
    model: string,
    responseTimeMs: number
  ): Promise<IAiHintUsageDocument> {
    const hintEntry = { hint, model, responseTimeMs, createdAt: new Date() };

    const doc = await this.model.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        problemId: new Types.ObjectId(problemId),
      },
      {
        $inc: { hintsUsed: 1 },
        $push: { generatedHints: hintEntry },
        $set: { lastHintAt: new Date() },
      },
      { new: true, upsert: true }
    ).exec();

    if (!doc) throw new Error('Failed to persist hint usage');
    return doc;
  }
}
