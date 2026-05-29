import { ISubscriptionDocument } from '../../../infrastructure/database/models/subscription.model';
import { CreateSubscriptionDto } from '../../../dtos/payments/subscription.dto';

export interface ISubscriptionRepository {
  createSubscription(data: CreateSubscriptionDto): Promise<ISubscriptionDocument>;
  findActiveByUser(userId: string): Promise<ISubscriptionDocument | null>;
  findLatestByUser(userId: string): Promise<ISubscriptionDocument | null>;
  findByStripeSubscriptionId(stripeSubId: string): Promise<ISubscriptionDocument | null>;
  updateStatus(stripeSubId: string, status: string): Promise<ISubscriptionDocument | null>;
  updateById(id: string, data: Record<string, unknown>): Promise<ISubscriptionDocument | null>;
  renewSubscription(stripeSubId: string, newEndDate: Date): Promise<ISubscriptionDocument | null>;
  updateByStripeId(stripeSubId: string, data: Record<string, unknown>): Promise<ISubscriptionDocument | null>;
  expireOldSubscriptions(): Promise<void>;
}
