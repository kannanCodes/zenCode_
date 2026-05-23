import Stripe from 'stripe';
import { AppError } from '../../shared/utils/AppError';
import { STATUS_CODES } from '../../shared/constants/status';
import { StripeProductData, CheckoutSessionResult } from '../../interfaces/service-interfaces/payments/IPaymentTypes';
import { 
  StripeEvent, 
  StripeCheckoutSession, 
  StripeSubscription 
} from '../../interfaces/service-interfaces/payments/IStripeExtTypes';
import { IStripeService } from '../../interfaces/service-interfaces/payments/stripe.service.interface';
import { appConfig } from '../../config/appConfig';
import { PAYMENT_MESSAGES } from '../../constants/messages';

export class StripeService implements IStripeService {
  private readonly stripe: InstanceType<typeof Stripe>;

  constructor() {
    if (!appConfig.stripe.secretKey) {
      throw new AppError(PAYMENT_MESSAGES.STRIPE_SECRET_KEY_NOT_CONFIGURED, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    this.stripe = new Stripe(appConfig.stripe.secretKey, {
      apiVersion: '2026-04-22.dahlia',
    });
  }

  async createProductAndPrice(plan: {
    name: string;
    description: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    intervalCount: number;
  }): Promise<StripeProductData> {
    try {
      const product = await this.stripe.products.create({
        name: plan.name,
        description: plan.description,
      });

      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(plan.price * 100),
        currency: 'inr',
        recurring: {
          interval: plan.billingCycle === 'monthly' ? 'month' : 'year',
          interval_count: plan.intervalCount,
        },
      });

      return {
        productId: product.id,
        priceId: price.id,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        error instanceof Error ? error.message : PAYMENT_MESSAGES.STRIPE_PRODUCT_CREATION_FAILED,
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createCheckoutSession(priceId: string, userId: string): Promise<CheckoutSessionResult> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${appConfig.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appConfig.frontendUrl}/payment/cancel`,
        metadata: {
          userId,
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : PAYMENT_MESSAGES.STRIPE_CHECKOUT_SESSION_CREATION_FAILED,
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }

  async constructWebhookEvent(payload: Buffer, signature: string): Promise<StripeEvent> {
    const webhookSecret = appConfig.stripe.webhookSecret;
    if (!webhookSecret) {
      throw new AppError(PAYMENT_MESSAGES.STRIPE_WEBHOOK_SECRET_NOT_CONFIGURED, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret) as StripeEvent;
    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : PAYMENT_MESSAGES.WEBHOOK_SIGNATURE_VERIFICATION_FAILED,
        STATUS_CODES.BAD_REQUEST
      );
    }
  }

  async retrieveCheckoutSession(sessionId: string): Promise<StripeCheckoutSession> {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'customer'],
      });
    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : PAYMENT_MESSAGES.CHECKOUT_SESSION_RETRIEVAL_FAILED,
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }

  async cancelStripeSubscription(stripeSubscriptionId: string): Promise<StripeSubscription> {
    try {
      return await this.stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : PAYMENT_MESSAGES.SUBSCRIPTION_CANCEL_FAILED,
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }

  async upgradeSubscription(stripeSubscriptionId: string, newPriceId: string): Promise<StripeSubscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(stripeSubscriptionId);
      const subscriptionItemId = subscription.items.data[0].id;

      return await this.stripe.subscriptions.update(stripeSubscriptionId, {
        items: [
          {
            id: subscriptionItemId,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      });
    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : PAYMENT_MESSAGES.SUBSCRIPTION_UPGRADE_FAILED,
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }
  async archiveProduct(productId: string): Promise<void> {
    try {
      await this.stripe.products.update(productId, { active: false });
    } catch (error) {
      // Log error but don't throw, as this is often used in rollback
      console.error(`Failed to archive Stripe product ${productId}:`, error);
    }
  }
}
