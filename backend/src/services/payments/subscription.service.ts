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
import { IPlanDocument } from '../../infrastructure/database/models/plan.model';

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
      isActive: (sub.status === 'active' || sub.status === 'cancelled') && new Date(sub.endDate) > new Date(),
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

  async resumeUserSubscription(userId: string): Promise<ISubscriptionDocument | null> {
    const sub = await this.subscriptionRepo.findActiveByUser(userId);

    if (!sub) {
      throw new AppError(SUBSCRIPTION_MESSAGES.ACTIVE_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    await this.stripeService.resumeStripeSubscription(sub.stripeSubscriptionId);

    return this.subscriptionRepo.updateById(sub._id.toString(), {
      status: "active",
    });
  }

  async changePlan(userId: string, newPlanId: string): Promise<ISubscriptionDocument | { action: 'redirect'; url: string } | null> {
    const sub = await this.subscriptionRepo.findActiveByUser(userId);

    if (!sub) {
      throw new AppError(SUBSCRIPTION_MESSAGES.ACTIVE_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    if (sub.status === 'cancelled') {
      throw new AppError(SUBSCRIPTION_MESSAGES.CHANGE_CANCELLED_DENIED, STATUS_CODES.BAD_REQUEST);
    }

    const newPlan = await this.planRepo.findById(newPlanId);

    if (!newPlan || !newPlan.stripePriceId) {
      throw new AppError(SUBSCRIPTION_MESSAGES.PLAN_NOT_CONFIGURED, STATUS_CODES.NOT_FOUND);
    }

    if (!newPlan.isActive || newPlan.isArchived) {
      throw new AppError(SUBSCRIPTION_MESSAGES.PLAN_NOT_CONFIGURED, STATUS_CODES.NOT_FOUND);
    }

    const currentPlan =
      typeof sub.planId === 'object' && sub.planId !== null
        ? (sub.planId as IPlanDocument)
        : sub.planId ? await this.planRepo.findById(sub.planId.toString()) : null;

    if (!currentPlan) {
      // The current plan was deleted from the database.
      // We can't compare prices, so we treat it as an immediate upgrade.
      const stripeSub = await this.stripeService.changeSubscriptionPriceImmediately(
        sub.stripeSubscriptionId,
        newPlan.stripePriceId
      );
      const stripeItem = stripeSub.items.data[0] as unknown as { current_period_end?: number };

      return this.subscriptionRepo.updateById(sub._id.toString(), {
        planId: newPlan._id.toString(),
        endDate: stripeItem.current_period_end
          ? new Date(stripeItem.current_period_end * 1000)
          : sub.endDate,
        scheduledPlanId: null,
        scheduledChangeAt: null,
        scheduledChangeType: null,
        stripeScheduleId: null,
      });
    }

    if (!currentPlan.stripePriceId) {
      throw new AppError(SUBSCRIPTION_MESSAGES.PLAN_NOT_CONFIGURED, STATUS_CODES.NOT_FOUND);
    }

    if (currentPlan._id.toString() === newPlan._id.toString()) {
      throw new AppError(SUBSCRIPTION_MESSAGES.SAME_PLAN, STATUS_CODES.BAD_REQUEST);
    }

    if (newPlan.price > currentPlan.price) {
      const stripeSub = await this.stripeService.changeSubscriptionPriceImmediately(
        sub.stripeSubscriptionId,
        newPlan.stripePriceId
      );
      const stripeItem = stripeSub.items.data[0] as unknown as { current_period_end?: number };

      return this.subscriptionRepo.updateById(sub._id.toString(), {
        planId: newPlan._id.toString(),
        endDate: stripeItem.current_period_end
          ? new Date(stripeItem.current_period_end * 1000)
          : sub.endDate,
        scheduledPlanId: null,
        scheduledChangeAt: null,
        scheduledChangeType: null,
        stripeScheduleId: null,
      });
    }

    if (newPlan.price < currentPlan.price) {
      const scheduled = await this.stripeService.scheduleSubscriptionPriceChangeAtPeriodEnd(
        sub.stripeSubscriptionId,
        currentPlan.stripePriceId,
        newPlan.stripePriceId
      );

      return this.subscriptionRepo.updateById(sub._id.toString(), {
        scheduledPlanId: newPlan._id.toString(),
        scheduledChangeAt: scheduled.effectiveAt,
        scheduledChangeType: 'downgrade',
        stripeScheduleId: scheduled.scheduleId,
      });
    }

    const stripeSub = await this.stripeService.changeSubscriptionPriceImmediately(
      sub.stripeSubscriptionId,
      newPlan.stripePriceId
    );
    const stripeItem = stripeSub.items.data[0] as unknown as { current_period_end?: number };

    return this.subscriptionRepo.updateById(sub._id.toString(), {
      planId: newPlan._id.toString(),
      endDate: stripeItem.current_period_end
        ? new Date(stripeItem.current_period_end * 1000)
        : sub.endDate,
      scheduledPlanId: null,
      scheduledChangeAt: null,
      scheduledChangeType: null,
      stripeScheduleId: null,
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

  async updateSubscriptionStatus(stripeSubscriptionId: string, status: string, endDate?: Date): Promise<ISubscriptionDocument | null> {
    const update: Partial<ISubscriptionDocument> = { status: status as ISubscriptionDocument['status'] };
    if (endDate) update.endDate = endDate;

    const updated = await this.subscriptionRepo.updateByStripeId(
      stripeSubscriptionId,
      update
    );

    if (!updated) {
      logger.error(`Subscription ${stripeSubscriptionId} not found to update status to ${status}`);
    }
    return updated;
  }

  async handleStripeUpdate(stripeSubscriptionId: string, data: Partial<{
    status: string;
    planId: string;
    endDate: Date;
    scheduledPlanId: string | null;
    scheduledChangeAt: Date | null;
    scheduledChangeType: string | null;
    stripeScheduleId: string | null;
  }>): Promise<ISubscriptionDocument | null> {
    const existing = await this.subscriptionRepo.findByStripeSubscriptionId(stripeSubscriptionId);
    const updatedData: Record<string, unknown> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updatedData[key] = value;
      }
    });

    if (data.status !== undefined) {
      updatedData.status = data.status as ISubscriptionDocument['status'];
    }

    if (existing && data.planId) {
      const scheduledPlanId =
        existing.scheduledPlanId && typeof existing.scheduledPlanId === 'object'
          ? (existing.scheduledPlanId as IPlanDocument)._id.toString()
          : existing.scheduledPlanId?.toString();
      const currentPlanId =
        typeof existing.planId === 'object'
          ? (existing.planId as IPlanDocument)._id.toString()
          : existing.planId.toString();
      const stripePlanActuallyChanged = data.planId !== currentPlanId;
      const scheduledChangeApplied = scheduledPlanId && data.planId === scheduledPlanId;

      if (stripePlanActuallyChanged || scheduledChangeApplied) {
        updatedData.scheduledPlanId = null;
        updatedData.scheduledChangeAt = null;
        updatedData.scheduledChangeType = null;
        updatedData.stripeScheduleId = null;
      }
    }

    const updated = await this.subscriptionRepo.updateByStripeId(
      stripeSubscriptionId,
      updatedData
    );

    if (!updated) {
      logger.error(`Subscription ${stripeSubscriptionId} not found for data update`);
    }
    return updated;
  }
}
