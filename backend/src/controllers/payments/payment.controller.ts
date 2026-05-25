import { Request, Response, NextFunction } from 'express';
import { IStripeService } from '../../interfaces/service-interfaces/payments/stripe.service.interface';
import { IPlanRepository } from '../../interfaces/repository-interfaces/admin/IPlanRepository';
import { ISubscriptionService } from '../../interfaces/service-interfaces/payments/subscription.service.interface';
import { sendSuccess } from '../../shared/http/response';
import { AppError } from '../../shared/utils/AppError';
import { StripeSubscription } from '../../interfaces/service-interfaces/payments/IStripeExtTypes';
import { STATUS_CODES } from '../../shared/constants/status';
import { PLAN_MESSAGES, PAYMENT_MESSAGES, SUBSCRIPTION_MESSAGES } from '../../constants/messages';

const getStripeObjectId = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === 'string' ? id : null;
  }
  return null;
};

export class PaymentController {
  constructor(
    private readonly stripeService: IStripeService,
    private readonly planRepo: IPlanRepository,
    private readonly subscriptionService: ISubscriptionService
  ) {}

  createCheckout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { planId } = req.body;
      const userId = req.user!.id;

      // Block duplicate active subscriptions
      const hasActive = await this.subscriptionService.hasActiveSubscription(userId);
      if (hasActive) {
        throw new AppError(
          SUBSCRIPTION_MESSAGES.ACTIVE_EXISTS,
          STATUS_CODES.BAD_REQUEST
        );
      }

      const plan = await this.planRepo.findById(planId);
      if (!plan) {
        throw new AppError(PLAN_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
      }

      if (!plan.isActive || plan.isArchived) {
        throw new AppError(PLAN_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
      }

      if (!plan.stripePriceId) {
        throw new AppError(SUBSCRIPTION_MESSAGES.PLAN_NOT_CONFIGURED, STATUS_CODES.INTERNAL_SERVER_ERROR);
      }

      const session = await this.stripeService.createCheckoutSession(
        plan.stripePriceId,
        userId
      );

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: PAYMENT_MESSAGES.CHECKOUT_CREATED,
        data: {
          sessionId: session.sessionId,
          url: session.url,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  verifySession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId } = req.body;
      const userId = req.user!.id;

      if (!sessionId) {
        throw new AppError(PAYMENT_MESSAGES.SESSION_REQUIRED, STATUS_CODES.BAD_REQUEST);
      }

      const session = await this.stripeService.retrieveCheckoutSession(sessionId);

      // Verify the session actually belongs to this user
      if (session.metadata?.userId !== userId) {
        throw new AppError(PAYMENT_MESSAGES.UNAUTHORIZED_SESSION, STATUS_CODES.UNAUTHORIZED);
      }

      if (session.payment_status !== "paid") {
        throw new AppError(PAYMENT_MESSAGES.PAYMENT_NOT_COMPLETED, STATUS_CODES.BAD_REQUEST);
      }

      const stripeSubscriptionId = getStripeObjectId(session.subscription);
      const stripeCustomerId = getStripeObjectId(session.customer);

      if (!stripeSubscriptionId) {
        throw new AppError(PAYMENT_MESSAGES.NO_SUBSCRIPTION_IN_SESSION, STATUS_CODES.BAD_REQUEST);
      }

      if (!stripeCustomerId) {
        throw new AppError(PAYMENT_MESSAGES.FAILED_TO_RETRIEVE_SUBSCRIPTION, STATUS_CODES.INTERNAL_SERVER_ERROR);
      }

      // Check if the webhook already processed it
      let subscription = await this.subscriptionService.getActiveSubscription(userId);

      // If the active subscription has the same stripe id, it means webhook beat us to it
      if (subscription && subscription.stripeSubscriptionId === stripeSubscriptionId) {
        sendSuccess(res, {
          statusCode: STATUS_CODES.OK,
          message: PAYMENT_MESSAGES.SESSION_VERIFIED_WEBHOOK,
        });
        return;
      }

      // Otherwise, the webhook hasn't processed it yet, or the user didn't have an active one.
      // We need to fetch the full subscription from Stripe to get the period_end
      const stripeSub = session.subscription as StripeSubscription;
      
      if (!stripeSub || !stripeSub.items || stripeSub.items.data.length === 0) {
          throw new AppError(PAYMENT_MESSAGES.FAILED_TO_RETRIEVE_SUBSCRIPTION, STATUS_CODES.INTERNAL_SERVER_ERROR);
      }

      const priceId = stripeSub.items.data[0].price.id;
      const plan = await this.planRepo.findByStripePriceId(priceId);

      if (!plan) {
        throw new AppError(PAYMENT_MESSAGES.PLAN_NOT_FOUND_FOR_SUBSCRIPTION, STATUS_CODES.NOT_FOUND);
      }

      const item = stripeSub.items.data[0];
      await this.subscriptionService.createSubscription({
        userId,
        planId: plan._id.toString(),
        stripeCustomerId,
        stripeSubscriptionId,
        status: "active",
        startDate: new Date(item.current_period_start * 1000),
        endDate: new Date(item.current_period_end * 1000),
      });

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: PAYMENT_MESSAGES.SESSION_VERIFIED_SYNC,
      });
    } catch (error) {
      next(error);
    }
  };
}
