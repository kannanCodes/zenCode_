import { 
  StripeEvent, 
  StripeCheckoutSession, 
  StripeSubscription 
} from './IStripeExtTypes';
import { StripeProductData, CheckoutSessionResult } from './IPaymentTypes';

export interface IStripeService {
  createProductAndPrice(plan: {
    name: string;
    description: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    intervalCount: number;
  }): Promise<StripeProductData>;
  createCheckoutSession(priceId: string, userId: string): Promise<CheckoutSessionResult>;
  constructWebhookEvent(payload: Buffer, signature: string): Promise<StripeEvent>;
  retrieveCheckoutSession(sessionId: string): Promise<StripeCheckoutSession>;
  cancelStripeSubscription(stripeSubscriptionId: string): Promise<StripeSubscription>;
  resumeStripeSubscription(stripeSubscriptionId: string): Promise<StripeSubscription>;
  upgradeSubscription(stripeSubscriptionId: string, newPriceId: string): Promise<StripeSubscription>;
  changeSubscriptionPriceImmediately(stripeSubscriptionId: string, newPriceId: string): Promise<StripeSubscription>;
  scheduleSubscriptionPriceChangeAtPeriodEnd(
    stripeSubscriptionId: string,
    currentPriceId: string,
    newPriceId: string
  ): Promise<{ scheduleId: string; effectiveAt: Date }>;
  archiveProduct(productId: string): Promise<void>;
}
