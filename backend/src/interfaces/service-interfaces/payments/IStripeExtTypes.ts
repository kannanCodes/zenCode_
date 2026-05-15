import { Stripe } from 'stripe';

export type StripeEvent = any;
export type StripeCheckoutSession = Stripe['checkout']['sessions']['retrieve'] extends (...args: any) => Promise<infer T> ? T : any;
export type StripeSubscription = Stripe['subscriptions']['retrieve'] extends (...args: any) => Promise<infer T> ? T : any;
export type StripeInvoice = Stripe['invoices']['retrieve'] extends (...args: any) => Promise<infer T> ? T : any;
export type StripeProduct = Stripe['products']['retrieve'] extends (...args: any) => Promise<infer T> ? T : any;
export type StripePrice = Stripe['prices']['retrieve'] extends (...args: any) => Promise<infer T> ? T : any;
export type StripeDeletedSubscription = Stripe['subscriptions']['cancel'] extends (...args: any) => Promise<infer T> ? T : any;

// Specific event types for type safety in switch cases
export type StripeCheckoutSessionCompletedEvent = StripeEvent & {
  type: 'checkout.session.completed';
  data: {
    object: StripeCheckoutSession;
  };
}

export type StripeCustomerSubscriptionDeletedEvent = StripeEvent & {
  type: 'customer.subscription.deleted';
  data: {
    object: StripeSubscription;
  };
}

export type StripeCustomerSubscriptionUpdatedEvent = StripeEvent & {
  type: 'customer.subscription.updated';
  data: {
    object: StripeSubscription;
  };
}

export type StripeInvoicePaymentFailedEvent = StripeEvent & {
  type: 'invoice.payment_failed';
  data: {
    object: StripeInvoice;
  };
}

export type StripeInvoicePaidEvent = StripeEvent & {
  type: 'invoice.paid';
  data: {
    object: StripeInvoice;
  };
}

export type StripeInvoicePaymentSucceededEvent = StripeEvent & {
  type: 'invoice.payment_succeeded';
  data: {
    object: StripeInvoice;
  };
}
