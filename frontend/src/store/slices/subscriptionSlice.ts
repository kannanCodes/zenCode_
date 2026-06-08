import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { subscriptionService } from '../../features/subscription/services/subscription.service';
import type {
  SubscriptionState,
  Subscription,
  ChangePlanPayload,
  SubscriptionUiState,
} from '../../features/subscription/types/subscription.types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Derives `isPremium` from the subscription object.
 * A user is premium if the backend says isActive=true AND status is active.
 * A cancelled subscription that is still within billing period also qualifies.
 */
const deriveIsPremium = (sub: Subscription | null): boolean => {
  if (!sub) return false;
  // Backend's `isActive` field already accounts for endDate > now
  return sub.isActive === true;
};

const derivePlanId = (sub: Subscription | null): string | null => {
  if (!sub) return null;
  if (typeof sub.planId === 'string') return sub.planId;
  if (!sub.planId) return null; // plan was deleted — populate returns null
  return sub.planId._id;
};

const derivePlanPrice = (sub: Subscription | null): number | null => {
  if (!sub) return null;
  if (typeof sub.planId === 'object' && sub.planId !== null) return sub.planId.price;
  return null;
};

const deriveSubscriptionUiState = (sub: Subscription | null): SubscriptionUiState | null => {
  if (!sub) return null;

  if (sub.status === 'cancelled') {
    return sub.isActive ? 'active_cancel_scheduled' : 'cancelled';
  }

  return sub.status;
};

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState: SubscriptionState = {
  subscription: null,
  isPremium: false,
  currentPlanId: null,
  currentPlanPrice: null,
  subscriptionStatus: null,
  subscriptionUiState: null,
  expiryDate: null,
  isLoading: false,
  isHydrated: false,
  error: null,
};

// ─── Helpers to apply fetch result ───────────────────────────────────────────

const applyFetchResult = (state: SubscriptionState, sub: Subscription | null) => {
  state.subscription = sub;
  state.isPremium = deriveIsPremium(sub);
  state.currentPlanId = derivePlanId(sub);
  state.currentPlanPrice = derivePlanPrice(sub);
  state.subscriptionStatus = sub?.status ?? null;
  state.subscriptionUiState = deriveSubscriptionUiState(sub);
  state.expiryDate = sub?.endDate ?? null;
  state.isLoading = false;
  state.isHydrated = true;
  state.error = null;
};

// ─── Thunks ──────────────────────────────────────────────────────────────────

/**
 * Fetches the current user's subscription and syncs Redux.
 * Called on app load, after payment, and after cancellation.
 */
export const fetchSubscription = createAsyncThunk<Subscription | null, void, { rejectValue: string }>(
  'subscription/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await subscriptionService.getMySubscription();
    } catch (err: any) {
      // 404 = user has no subscription — not an error
      if (err?.response?.status === 404) return null;
      return rejectWithValue('Failed to fetch subscription');
    }
  }
);

/**
 * Cancels the user's active Stripe subscription.
 * The sub stays active until the end of the billing period.
 */
export const cancelSubscription = createAsyncThunk<void, void, { rejectValue: string }>(
  'subscription/cancel',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await subscriptionService.cancelSubscription();
      await dispatch(fetchSubscription());
    } catch {
      return rejectWithValue('Failed to cancel subscription');
    }
  }
);

export const resumeSubscription = createAsyncThunk<void, void, { rejectValue: string }>(
  'subscription/resume',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await subscriptionService.resumeSubscription();
      await dispatch(fetchSubscription());
    } catch {
      return rejectWithValue('Failed to resume subscription');
    }
  }
);

/**
 * Upgrades or downgrades the user to a new plan.
 */
export const changePlan = createAsyncThunk<void, ChangePlanPayload, { rejectValue: string }>(
  'subscription/changePlan',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const result = await subscriptionService.changePlan(payload);
      if ('action' in result && result.action === 'redirect') {
        window.location.href = result.url;
        return;
      }
      await dispatch(fetchSubscription());
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to change plan';
      return rejectWithValue(message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    /** Clear state on logout */
    clearSubscription(state) {
      state.subscription = null;
      state.isPremium = false;
      state.currentPlanId = null;
      state.currentPlanPrice = null;
      state.subscriptionStatus = null;
      state.subscriptionUiState = null;
      state.expiryDate = null;
      state.isHydrated = true; // keep true so navbar doesn't flash after logout
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ─── fetchSubscription ────────────────────────────────────────────────
    builder.addCase(fetchSubscription.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchSubscription.fulfilled, (state, action) => {
      applyFetchResult(state, action.payload);
    });
    builder.addCase(fetchSubscription.rejected, (state, action) => {
      state.isLoading = false;
      state.isHydrated = true; // resolve even on failure so navbar renders
      state.error = action.payload ?? 'Unknown error';
    });

    // ─── cancelSubscription ───────────────────────────────────────────────
    builder.addCase(cancelSubscription.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(cancelSubscription.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(cancelSubscription.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload ?? 'Unknown error';
    });

    // ─── resumeSubscription ───────────────────────────────────────────────
    builder.addCase(resumeSubscription.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(resumeSubscription.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(resumeSubscription.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload ?? 'Unknown error';
    });

    // ─── changePlan ───────────────────────────────────────────────────────
    builder.addCase(changePlan.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(changePlan.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(changePlan.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload ?? 'Unknown error';
    });
  },
});

export const { clearSubscription } = subscriptionSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export type RootState = ReturnType<typeof import('../index').store.getState>;

export const selectSubscription       = (state: RootState) => state.subscription.subscription;
export const selectIsPremium          = (state: RootState) => state.subscription.isPremium;
export const selectCurrentPlanId      = (state: RootState) => state.subscription.currentPlanId;
export const selectCurrentPlanPrice   = (state: RootState) => state.subscription.currentPlanPrice;
export const selectSubscriptionStatus = (state: RootState) => state.subscription.subscriptionStatus;
export const selectSubscriptionUiState = (state: RootState) => state.subscription.subscriptionUiState;
export const selectExpiryDate         = (state: RootState) => state.subscription.expiryDate;
export const selectSubscriptionLoading= (state: RootState) => state.subscription.isLoading;
export const selectIsHydrated         = (state: RootState) => state.subscription.isHydrated;
export const selectHasFeatureAccess =
  (feature: keyof import('../../features/subscription/types/subscription.types').PlanAccess) =>
  (state: RootState): boolean => {
    const { subscription, isPremium } = state.subscription;
    if (!isPremium) return false;

    if (typeof subscription?.planId === 'object' && subscription.planId !== null) {
      return subscription.planId.access?.[feature] === true;
    }

    return true;
  };

export default subscriptionSlice.reducer;
