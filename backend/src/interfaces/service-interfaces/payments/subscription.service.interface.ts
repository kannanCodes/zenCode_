import { CreateSubscriptionDto } from '../../../dtos/payments/subscription.dto';
import { ISubscriptionDocument } from '../../../infrastructure/database/models/subscription.model';

export interface ISubscriptionService {
  createSubscription(data: CreateSubscriptionDto): Promise<ISubscriptionDocument>;
  hasActiveSubscription(userId: string): Promise<boolean>;
  getActiveSubscription(userId: string): Promise<ISubscriptionDocument | null>;
  getUserSubscriptionDetails(userId: string): Promise<Record<string, unknown> | null>;
  cancelUserSubscription(userId: string): Promise<ISubscriptionDocument | null>;
  changePlan(userId: string, newPlanId: string): Promise<ISubscriptionDocument | null>;
  cancelSubscription(stripeSubscriptionId: string): Promise<ISubscriptionDocument | null>;
  renewSubscription(stripeSubscriptionId: string, endDate: Date): Promise<ISubscriptionDocument | null>;
  updateSubscriptionStatus(stripeSubscriptionId: string, status: string, endDate?: Date): Promise<ISubscriptionDocument | null>;
  handleStripeUpdate(stripeSubscriptionId: string, data: Partial<{ status: string, planId: string, endDate: Date }>): Promise<ISubscriptionDocument | null>;
}
