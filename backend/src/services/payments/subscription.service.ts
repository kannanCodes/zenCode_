import { ISubscriptionService } from '../../interfaces/service-interfaces/payments/subscription.service.interface';
import { CreateSubscriptionDto } from '../../dtos/payments/subscription.dto';
import { ISubscriptionRepository } from '../../interfaces/repository-interfaces/payments/ISubscriptionRepository';
import { IStripeService } from '../../interfaces/service-interfaces/payments/stripe.service.interface';
import { IPlanRepository } from '../../interfaces/repository-interfaces/admin/IPlanRepository';
import { AppError } from '../../shared/utils/AppError';
import { STATUS_CODES } from '../../shared/constants/status';
import { SUBSCRIPTION_MESSAGES } from '../../constants/messages';
import { ISubscriptionDocument } from '../../infrastructure/database/models/subscription.model';
import { logger } from '../../shared/utils/Logger';

export class SubscriptionService implements ISubscriptionService {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly stripeService: IStripeService,
    private readonly planRepo: IPlanRepository
  ) {}

  async createSubscription(data: CreateSubscriptionDto): Promise<ISubscriptionDocument> {
    const existing = await this.subscriptionRepo.findByStripeSubscriptionId(
      data.stripeSubscriptionId
    );
    if (existing) return existing;
    return this.subscriptionRepo.createSubscription(data);
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const sub = await this.subscriptionRepo.findActiveByUser(userId);
    if (!sub) return false;
    return new Date(sub.endDate) > new Date();
  }

  async getActiveSubscription(userId: string): Promise<ISubscriptionDocument | null> {
    return this.subscriptionRepo.findActiveByUser(userId);
  }

  async getUserSubscriptionDetails(userId: string): Promise<Record<string, unknown> | null> {
    const sub = await this.subscriptionRepo.findLatestByUser(userId);
    if (!sub) return null;

    return {
      ...sub.toObject(),
      isActive: sub.status === 'active' && new Date(sub.endDate) > new Date(),
    };
  }

  async cancelUserSubscription(userId: string): Promise<ISubscriptionDocument | null> {
    const sub = await this.subscriptionRepo.findActiveByUser(userId);

    if (!sub) {
      throw new AppError(SUBSCRIPTION_MESSAGES.ACTIVE_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    await this.stripeService.cancelStripeSubscription(sub.stripeSubscriptionId);

    return this.subscriptionRepo.updateById(sub._id.toString(), {
      status: "cancelled",
    });
  }

  async changePlan(userId: string, newPlanId: string): Promise<ISubscriptionDocument | null> {
    const sub = await this.subscriptionRepo.findActiveByUser(userId);

    if (!sub) {
      throw new AppError(SUBSCRIPTION_MESSAGES.ACTIVE_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    const newPlan = await this.planRepo.findById(newPlanId);

    if (!newPlan || !newPlan.stripePriceId) {
      throw new AppError(SUBSCRIPTION_MESSAGES.PLAN_NOT_CONFIGURED, STATUS_CODES.NOT_FOUND);
    }

    // Update subscription on Stripe (prorated billing applied automatically)
    await this.stripeService.upgradeSubscription(
      sub.stripeSubscriptionId,
      newPlan.stripePriceId
    );

    // Update planId in our DB
    return this.subscriptionRepo.updateById(sub._id.toString(), {
      planId: newPlanId,
    });
  }

  async cancelSubscription(stripeSubscriptionId: string): Promise<ISubscriptionDocument | null> {
    const updated = await this.subscriptionRepo.updateStatus(stripeSubscriptionId, "cancelled");
    if (!updated) {
      logger.error(`Subscription ${stripeSubscriptionId} not found to cancel`);
    }
    return updated;
  }

  async renewSubscription(stripeSubscriptionId: string, newEndDate: Date): Promise<ISubscriptionDocument | null> {
    const updated = await this.subscriptionRepo.renewSubscription(stripeSubscriptionId, newEndDate);
    if (!updated) {
      logger.error(`Subscription ${stripeSubscriptionId} not found for renewal`);
    }
    return updated;
  }
}
