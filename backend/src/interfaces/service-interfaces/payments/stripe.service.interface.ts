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
  upgradeSubscription(stripeSubscriptionId: string, newPriceId: string): Promise<StripeSubscription>;
}
