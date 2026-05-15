import api from '../../../shared/lib/axios';
import type { Subscription, ChangePlanPayload } from '../types/subscription.types';

interface SubscriptionResponse {
  success: boolean;
  message: string;
  data: Subscription | null;
}

export const subscriptionService = {
  /**
   * Fetches the authenticated user's current subscription.
   * GET /api/subscription/me
   */
  getMySubscription: async (): Promise<Subscription | null> => {
    const response = await api.get<SubscriptionResponse>('/subscriptions/me');
    return response.data.data;
  },

  /**
   * Cancels the authenticated user's active subscription on Stripe.
   * Subscription remains active until end of billing period.
   * DELETE /api/subscriptions/cancel
   */
  cancelSubscription: async (): Promise<void> => {
    await api.delete('/subscriptions/cancel');
  },

  /**
   * Upgrade or downgrade to a different plan (prorated billing via Stripe).
   * PATCH /api/subscriptions/change-plan
   */
  changePlan: async (payload: ChangePlanPayload): Promise<Subscription> => {
    const response = await api.patch<SubscriptionResponse>('/subscriptions/change-plan', payload);
    return response.data.data as Subscription;
  },
};
