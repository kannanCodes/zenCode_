// ─── Plan ───────────────────────────────────────────────────────────────────

export interface PlanAccess {
  mentorBooking: boolean;
  premiumProblems: boolean;
  aiHints: boolean;
}

export interface PlanFeature {
  _id?: string;
  name: string;
  description?: string;
  enabled: boolean;
}

export interface Plan {
  _id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  description: string;
  features: PlanFeature[];
  access: PlanAccess;
  stripePriceId: string;
  isActive: boolean;
}

// ─── Subscription ────────────────────────────────────────────────────────────

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due' | 'unpaid';
export type SubscriptionUiState =
  | 'active'
  | 'active_cancel_scheduled'
  | 'cancelled'
  | 'expired'
  | 'past_due'
  | 'unpaid';

export interface Subscription {
  _id: string;
  userId: string;
  planId: Plan | string;            // populated or raw id
  scheduledPlanId?: Plan | string | null;
  scheduledChangeAt?: string | null;
  scheduledChangeType?: 'upgrade' | 'downgrade' | null;
  stripeScheduleId?: string | null;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  startDate: string;                // ISO string
  endDate: string;                  // ISO string
  isActive: boolean;                // computed by backend (status=active AND endDate > now)
  createdAt: string;
  updatedAt: string;
}

// ─── Redux State ─────────────────────────────────────────────────────────────

export interface SubscriptionState {
  subscription: Subscription | null;
  isPremium: boolean;
  currentPlanId: string | null;
  currentPlanPrice: number | null;  // used to derive upgrade vs downgrade direction
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionUiState: SubscriptionUiState | null;
  expiryDate: string | null;
  isLoading: boolean;
  isHydrated: boolean;              // true after first fetch resolves (prevents navbar flash)
  error: string | null;
}

// ─── API Payloads ────────────────────────────────────────────────────────────

export interface CheckoutPayload {
  planId: string;
}

export interface CheckoutResponse {
  sessionId: string;
  url: string;
}

export interface ChangePlanPayload {
  planId: string;
}
