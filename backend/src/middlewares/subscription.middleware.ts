import { Request, Response, NextFunction } from "express";
import { ISubscriptionService } from "../interfaces/service-interfaces/payments/subscription.service.interface";
import { IPlanRepository } from "../interfaces/repository-interfaces/admin/IPlanRepository";
import { AppError } from "../shared/utils/AppError";
import { IPlanDocument } from "../infrastructure/database/models/plan.model";
import { STATUS_CODES } from "../shared/constants/status";
import { SUBSCRIPTION_MESSAGES, PLAN_MESSAGES } from "../constants/messages";

export type PlanFeature = "mentorBooking" | "premiumProblems" | "aiHints";

export class SubscriptionMiddleware {
  constructor(
    private readonly subscriptionService: ISubscriptionService,
    private readonly planRepo: IPlanRepository
  ) {}

  /** Shared: validates that the user has an active, non-expired subscription. */
  private async _validateSubscription(userId: string) {
    const subscription = await this.subscriptionService.getActiveSubscription(userId);

    if (!subscription) {
      throw new AppError(SUBSCRIPTION_MESSAGES.REQUIRED, STATUS_CODES.FORBIDDEN);
    }

    if (new Date(subscription.endDate) < new Date()) {
      throw new AppError(SUBSCRIPTION_MESSAGES.EXPIRED, STATUS_CODES.FORBIDDEN);
    }

    return subscription;
  }

  requireFeatureAccess = (feature: PlanFeature) => {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        const userId = req.user!.id;
        const subscription = await this._validateSubscription(userId);

        // subscription.planId is populated by findActiveByUser
        const planId =
          typeof subscription.planId === "object" && "_id" in (subscription.planId as IPlanDocument)
            ? (subscription.planId as IPlanDocument)._id.toString()
            : subscription.planId.toString();

        const plan = await this.planRepo.findById(planId);

        if (!plan) {
          throw new AppError(PLAN_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
        }

        if (!plan.access?.[feature]) {
          throw new AppError(SUBSCRIPTION_MESSAGES.FEATURE_DENIED, STATUS_CODES.FORBIDDEN);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  requireSubscription = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await this._validateSubscription(req.user!.id);
      next();
    } catch (error) {
      next(error);
    }
  };
}
