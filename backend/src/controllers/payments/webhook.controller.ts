import { Request, Response } from 'express';
import { IStripeService } from '../../interfaces/service-interfaces/payments/stripe.service.interface';
import { ISubscriptionService } from '../../interfaces/service-interfaces/payments/subscription.service.interface';
import { IPlanRepository } from '../../interfaces/repository-interfaces/admin/IPlanRepository';
import { logger } from '../../shared/utils/Logger';
import { sendSuccess, sendError } from '../../shared/http/response';
import { PaymentTransaction } from '../../infrastructure/database/models/payment-transaction.model';
import User from '../../infrastructure/database/models/user.model';
import { Subscription } from '../../infrastructure/database/models/subscription.model';
import { STATUS_CODES } from '../../shared/constants/status';
import { GLOBAL_MESSAGES, PAYMENT_MESSAGES } from '../../constants/messages';
import { 
  StripeEvent, 
  StripeCheckoutSessionCompletedEvent, 
  StripeCustomerSubscriptionDeletedEvent, 
  StripeCustomerSubscriptionUpdatedEvent,
  StripeInvoicePaymentSucceededEvent,
  StripeInvoicePaymentFailedEvent,
  StripeInvoicePaidEvent
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
      logger.error('❌ Webhook signature verification failed:', err instanceof Error ? err.message : GLOBAL_MESSAGES.UNKNOWN_ERROR);
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
            const sub = subscription as unknown as { items: { data: [{ price: { id: string } }] }, current_period_end: number };
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

          // Log transaction
          try {
            const customerId = invoice.customer as string;
            const sub = await Subscription.findOne({ stripeSubscriptionId: invoice.subscription as string });
            
            if (sub) {
              await PaymentTransaction.create({
                userId: sub.userId,
                subscriptionId: invoice.subscription as string,
                stripeInvoiceId: invoice.id,
                amount: invoice.amount_due / 100, // Stripe uses cents
                currency: invoice.currency || 'inr',
                status: 'failed',
              });
            }
          } catch (err) {
            logger.error('❌ Failed to log payment transaction (failed):', err);
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
              const line = invoice.lines.data[0] as unknown as { price?: { id?: string } };
              const priceId = line.price?.id;
              const plan = priceId ? await this.planRepo.findByStripePriceId(priceId) : null;

              if (plan) {
                await this.subscriptionService.handleStripeUpdate(
                  stripeSubscriptionId,
                  {
                    status: 'active',
                    planId: plan._id.toString(),
                    endDate: new Date(periodEnd * 1000),
                    scheduledPlanId: null,
                    scheduledChangeAt: null,
                    scheduledChangeType: null,
                    stripeScheduleId: null,
                  }
                );
                logger.info(`✅ Subscription renewed and reconciled: ${stripeSubscriptionId}`);
                break;
              }

              await this.subscriptionService.renewSubscription(
                stripeSubscriptionId,
                new Date(periodEnd * 1000)
              );
              logger.info(`✅ Subscription renewed: ${stripeSubscriptionId}`);
            }
          }

          // Log transaction
          try {
            const customerId = invoice.customer as string;
            const sub = await Subscription.findOne({ stripeSubscriptionId: stripeSubscriptionId as string });
            
            if (sub) {
              const line = invoice.lines.data[0] as unknown as { price?: { id?: string } };
              const priceId = line.price?.id;
              const plan = priceId ? await this.planRepo.findByStripePriceId(priceId) : null;

              await PaymentTransaction.create({
                userId: sub.userId,
                subscriptionId: stripeSubscriptionId as string,
                planId: plan?._id,
                stripeInvoiceId: invoice.id,
                amount: invoice.amount_paid / 100, // Stripe uses cents
                currency: invoice.currency || 'inr',
                status: 'succeeded',
              });
            }
          } catch (err) {
            logger.error('❌ Failed to log payment transaction (succeeded):', err);
          }
          break;
        }

        case 'subscription_schedule.created':
        case 'subscription_schedule.updated': {
          const schedule = event.data.object as {
            id: string;
            status?: string;
            subscription?: string | { id?: string } | null;
            phases?: Array<{
              start_date?: number;
              items?: Array<{ price?: string | { id?: string } }>;
            }>;
          };
          const stripeSubscriptionId =
            typeof schedule.subscription === 'string'
              ? schedule.subscription
              : schedule.subscription?.id;

          if (!stripeSubscriptionId) break;

          const futurePhase = schedule.phases?.[1];
          const futurePrice = futurePhase?.items?.[0]?.price;
          const futurePriceId = typeof futurePrice === 'string' ? futurePrice : futurePrice?.id;
          const futurePlan = futurePriceId ? await this.planRepo.findByStripePriceId(futurePriceId) : null;

          if (futurePlan && futurePhase?.start_date) {
            await this.subscriptionService.handleStripeUpdate(stripeSubscriptionId, {
              scheduledPlanId: futurePlan._id.toString(),
              scheduledChangeAt: new Date(futurePhase.start_date * 1000),
              scheduledChangeType: 'downgrade',
              stripeScheduleId: schedule.id,
            });
            logger.info(`✅ Subscription schedule synced: ${schedule.id}`);
          }
          break;
        }

        case 'subscription_schedule.canceled':
        case 'subscription_schedule.completed':
        case 'subscription_schedule.released': {
          const schedule = event.data.object as {
            id: string;
            subscription?: string | { id?: string } | null;
          };
          const stripeSubscriptionId =
            typeof schedule.subscription === 'string'
              ? schedule.subscription
              : schedule.subscription?.id;

          if (stripeSubscriptionId) {
            await this.subscriptionService.handleStripeUpdate(stripeSubscriptionId, {
              scheduledPlanId: null,
              scheduledChangeAt: null,
              scheduledChangeType: null,
              stripeScheduleId: null,
            });
            logger.info(`✅ Subscription schedule cleared: ${schedule.id}`);
          }
          break;
        }

        default:
          logger.info(`ℹ️ Unhandled Stripe event: ${event.type}`);
      }

      sendSuccess(res, { statusCode: STATUS_CODES.OK, data: { received: true } });
    } catch (error) {
      logger.error('❌ Webhook processing error:', error instanceof Error ? error.message : GLOBAL_MESSAGES.UNKNOWN_ERROR);
      sendError(res, PAYMENT_MESSAGES.WEBHOOK_FAILED, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  };
}
