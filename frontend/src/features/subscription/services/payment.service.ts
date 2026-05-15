import api from '../../../shared/lib/axios';
import type { CheckoutPayload, CheckoutResponse } from '../types/subscription.types';

interface CheckoutApiResponse {
  success: boolean;
  message: string;
  data: CheckoutResponse;
}

export const paymentService = {
  /**
   * Creates a Stripe Checkout session for a given plan.
   * On success, caller should redirect to returned `url`.
   * POST /api/payments/checkout
   */
  createCheckout: async (payload: CheckoutPayload): Promise<CheckoutResponse> => {
    const response = await api.post<CheckoutApiResponse>('/payments/checkout', payload);
    return response.data.data;
  },

  /**
   * Synchronously verify a checkout session after redirect, bypassing webhook delays.
   * POST /api/payments/verify-session
   */
  verifySession: async (sessionId: string): Promise<void> => {
    await api.post('/payments/verify-session', { sessionId });
  },
};
