import { BaseRepository } from '../../infrastructure/database/repositories/base/base.repository';
import { ISubscriptionRepository } from '../../interfaces/repository-interfaces/payments/ISubscriptionRepository';
import { Subscription, ISubscriptionDocument } from '../../infrastructure/database/models/subscription.model';
import { CreateSubscriptionDto } from '../../dtos/payments/subscription.dto';

export class SubscriptionRepository extends BaseRepository<ISubscriptionDocument> implements ISubscriptionRepository {
  constructor() {
    super(Subscription);
  }

  async createSubscription(data: CreateSubscriptionDto): Promise<ISubscriptionDocument> {
    return this.create(data);
  }

  async findActiveByUser(userId: string): Promise<ISubscriptionDocument | null> {
    return this.model.findOne({
      userId,
      status: { $in: ['active', 'cancelled'] },
    }).populate('planId').populate('scheduledPlanId').exec();
  }

  async findLatestByUser(userId: string): Promise<ISubscriptionDocument | null> {
    return this.model.findOne({ userId })
      .sort({ createdAt: -1 })
      .populate('planId')
      .populate('scheduledPlanId')
      .exec();
  }

  async findByStripeSubscriptionId(stripeSubId: string): Promise<ISubscriptionDocument | null> {
    return this.findOne({
      stripeSubscriptionId: stripeSubId,
    });
  }

  async updateStatus(stripeSubId: string, status: string): Promise<ISubscriptionDocument | null> {
    return this.updateOne(
      { stripeSubscriptionId: stripeSubId },
      { status }
    );
  }

  async updateById(id: string, data: Record<string, unknown>): Promise<ISubscriptionDocument | null> {
    return this.model.findByIdAndUpdate(id, data, { returnDocument: 'after' }).exec();
  }

  async renewSubscription(stripeSubId: string, newEndDate: Date): Promise<ISubscriptionDocument | null> {
    return this.updateOne(
      { stripeSubscriptionId: stripeSubId },
      { endDate: newEndDate, status: 'active' }
    );
  }

  async updateByStripeId(stripeSubId: string, data: Record<string, unknown>): Promise<ISubscriptionDocument | null> {
    return this.updateOne(
      { stripeSubscriptionId: stripeSubId },
      data
    );
  }

  async expireOldSubscriptions(): Promise<void> {
    await this.model.updateMany(
      { status: { $in: ['active', 'cancelled'] }, endDate: { $lt: new Date() } },
      { status: 'expired' }
    ).exec();
  }
}
