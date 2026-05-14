import { Stripe } from 'stripe';

export type StripeEvent = ReturnType<Stripe['webhooks']['constructEvent']>;
export type StripeCheckoutSession = Awaited<ReturnType<Stripe['checkout']['sessions']['retrieve']>>;
export type StripeSubscription = Awaited<ReturnType<Stripe['subscriptions']['retrieve']>>;
export type StripeInvoice = Awaited<ReturnType<Stripe['invoices']['retrieve']>> & {
  subscription?: string | null;
};
export type StripeProduct = Awaited<ReturnType<Stripe['products']['retrieve']>>;
export type StripePrice = Awaited<ReturnType<Stripe['prices']['retrieve']>>;
export type StripeDeletedSubscription = Awaited<ReturnType<Stripe['subscriptions']['cancel']>>;

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

export type StripeInvoicePaymentSucceededEvent = StripeEvent & {
  type: 'invoice.payment_succeeded';
  data: {
    object: StripeInvoice;
  };
}
