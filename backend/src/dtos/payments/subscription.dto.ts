export interface CreateSubscriptionDto {
  userId: string;
  planId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'unpaid' | 'trialing';
  startDate: Date;
  endDate: Date;
}
