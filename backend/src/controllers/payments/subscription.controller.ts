import { Request, Response, NextFunction } from "express";
import { ISubscriptionService } from "../../interfaces/service-interfaces/payments/subscription.service.interface";
import { sendSuccess } from "../../shared/http/response";
import { STATUS_CODES } from "../../shared/constants/status";
import { SUBSCRIPTION_MESSAGES } from "../../constants/messages";

export class SubscriptionController {
  constructor(private readonly subscriptionService: ISubscriptionService) {}

  getMySubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const subscription = await this.subscriptionService.getUserSubscriptionDetails(userId);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: subscription ? SUBSCRIPTION_MESSAGES.FETCHED : SUBSCRIPTION_MESSAGES.NOT_FOUND,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  };

  cancelSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      await this.subscriptionService.cancelUserSubscription(userId);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: SUBSCRIPTION_MESSAGES.WILL_CANCEL,
      });
    } catch (error) {
      next(error);
    }
  };

  resumeSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const subscription = await this.subscriptionService.resumeUserSubscription(userId);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: SUBSCRIPTION_MESSAGES.RESUMED,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  };

  changePlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { planId } = req.body;

      const updated = await this.subscriptionService.changePlan(userId, planId);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: SUBSCRIPTION_MESSAGES.PLAN_CHANGED,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };
}
