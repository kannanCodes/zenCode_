export interface StripeProductData {
  productId: string;
  priceId: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string | null;
}
