import { Request, Response } from 'express';
import { IStripeService } from '../../interfaces/service-interfaces/payments/stripe.service.interface';
import { ISubscriptionService } from '../../interfaces/service-interfaces/payments/subscription.service.interface';
import { IPlanRepository } from '../../interfaces/repository-interfaces/admin/IPlanRepository';
import { logger } from '../../shared/utils/Logger';
import { sendSuccess, sendError } from '../../shared/http/response';
import { STATUS_CODES } from '../../shared/constants/status';
import { PAYMENT_MESSAGES } from '../../constants/messages';
import { 
  StripeEvent, 
  StripeCheckoutSessionCompletedEvent, 
  StripeCustomerSubscriptionDeletedEvent, 
  StripeCustomerSubscriptionUpdatedEvent,
  StripeInvoicePaymentSucceededEvent,
  StripeInvoicePaymentFailedEvent,
  StripeInvoicePaidEvent,
  StripeSubscription
} from '../../interfaces/service-interfaces/payments/IStripeExtTypes';

export class WebhookController {
  constructor(
    private readonly stripeService: IStripeService,
    private readonly subscriptionService: ISubscriptionService,
    private readonly planRepo: IPlanRepository
  ) {}

  stripeWebhookHandler = async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers['stripe-signature'];

    if (!signature || typeof signature !== 'string') {
      logger.error(`❌ ${PAYMENT_MESSAGES.MISSING_SIGNATURE}`);
      sendError(res, PAYMENT_MESSAGES.MISSING_SIGNATURE, STATUS_CODES.BAD_REQUEST);
      return;
    }

    let event: StripeEvent;

    try {
      const payload = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));
      event = await this.stripeService.constructWebhookEvent(payload, signature);
    } catch (err) {
      logger.error('❌ Webhook signature verification failed:', err instanceof Error ? err.message : 'Unknown error');
      sendError(res, PAYMENT_MESSAGES.INVALID_SIGNATURE, STATUS_CODES.BAD_REQUEST);
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const sessionEvent = event as StripeCheckoutSessionCompletedEvent;
          const session = sessionEvent.data.object;
          const userId = session.metadata?.userId;
          const stripeSubscriptionId = session.subscription as string;
          const stripeCustomerId = session.customer as string;

          if (!userId || !stripeSubscriptionId) {
            logger.error('❌ Missing userId or subscriptionId in session metadata');
            sendSuccess(res, { statusCode: STATUS_CODES.OK, data: { received: true } });
            return;
          }

          const fullSession = await this.stripeService.retrieveCheckoutSession(session.id);
          const subscription = fullSession.subscription;
          
          if (!subscription || typeof subscription === 'string') {
             logger.error('❌ Subscription not expanded in session');
             sendSuccess(res, { statusCode: STATUS_CODES.OK, data: { received: true } });
             return;
          }

          const priceId = subscription.items.data[0].price.id;
          const startDate = new Date(subscription.items.data[0].current_period_start * 1000);
          const endDate = new Date(subscription.items.data[0].current_period_end * 1000);

          const plan = await this.planRepo.findByStripePriceId(priceId);
          if (!plan) {
            logger.error(`❌ No plan found for Stripe priceId: ${priceId}`);
            sendSuccess(res, { statusCode: STATUS_CODES.OK, data: { received: true } });
            return;
          }

          await this.subscriptionService.createSubscription({
            userId,
            planId: plan._id.toString(),
            stripeCustomerId,
            stripeSubscriptionId,
            status: 'active',
            startDate,
            endDate,
          });

          logger.info(`✅ Subscription created for user: ${userId}`);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscriptionEvent = event as StripeCustomerSubscriptionDeletedEvent;
          const subscription = subscriptionEvent.data.object;
          await this.subscriptionService.cancelSubscription(subscription.id);
          logger.info(`✅ Subscription cancelled: ${subscription.id}`);
          break;
        }

        case 'customer.subscription.updated': {
          const subscriptionEvent = event as StripeCustomerSubscriptionUpdatedEvent;
          const subscription = subscriptionEvent.data.object;
          
          if (subscription.status !== 'deleted') {
            const sub = subscription as any; // Cast to any to access current_period_end safely
            const priceId = sub.items.data[0].price.id;
            const plan = await this.planRepo.findByStripePriceId(priceId);
            
            if (plan) {
              await this.subscriptionService.handleStripeUpdate(subscription.id, {
                status: subscription.status,
                planId: plan._id.toString(),
                endDate: new Date(sub.current_period_end * 1000),
              });
              logger.info(`✅ Subscription updated: ${subscription.id}`);
            }
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoiceEvent = event as StripeInvoicePaymentFailedEvent;
          const invoice = invoiceEvent.data.object;
          if (invoice.subscription) {
            await this.subscriptionService.updateSubscriptionStatus(
              invoice.subscription as string,
              'past_due'
            );
            logger.warn(`⚠️ Payment failed for subscription: ${invoice.subscription}`);
          }
          break;
        }

        case 'invoice.paid': {
          const invoiceEvent = event as StripeInvoicePaidEvent;
          const invoice = invoiceEvent.data.object;
          if (invoice.subscription) {
            await this.subscriptionService.updateSubscriptionStatus(
              invoice.subscription as string,
              'active'
            );
            logger.info(`✅ Invoice paid for subscription: ${invoice.subscription}`);
          }
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoiceEvent = event as StripeInvoicePaymentSucceededEvent;
          const invoice = invoiceEvent.data.object;
          const billingReason = invoice.billing_reason;
          const stripeSubscriptionId = invoice.subscription;

          if (billingReason === 'subscription_cycle' && stripeSubscriptionId) {
            const periodEnd = invoice.lines.data[0]?.period?.end;
            if (periodEnd) {
              await this.subscriptionService.renewSubscription(
                stripeSubscriptionId,
                new Date(periodEnd * 1000)
              );
              logger.info(`✅ Subscription renewed: ${stripeSubscriptionId}`);
            }
          }
          break;
        }

        default:
          logger.info(`ℹ️ Unhandled Stripe event: ${event.type}`);
      }

      sendSuccess(res, { statusCode: STATUS_CODES.OK, data: { received: true } });
    } catch (error) {
      logger.error('❌ Webhook processing error:', error instanceof Error ? error.message : 'Unknown error');
      sendError(res, PAYMENT_MESSAGES.WEBHOOK_FAILED, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  };
}
