import { StripeService } from '../../infrastructure/payments/stripe.service';
import { SubscriptionService } from '../../services/payments/subscription.service';
import { WebhookController } from '../../controllers/payments/webhook.controller';
import { PlanRepository } from '../../repositories/admin/PlanRepository';
import { SubscriptionRepository } from '../../repositories/payments/SubscriptionRepository';
import { PaymentController } from '../../controllers/payments/payment.controller';
import { SubscriptionController } from '../../controllers/payments/subscription.controller';
import { SubscriptionMiddleware } from '../../middlewares/subscription.middleware';
import { SubscriptionCronJobs } from '../../infrastructure/cron/subscription.cron';

// ── Repositories ───────────────────────────────────────────────────────────────
export const planRepository = new PlanRepository();
export const subscriptionRepository = new SubscriptionRepository();

// ── Infrastructure Services ───────────────────────────────────────────────────
export const stripeService = new StripeService();

// ── Domain Services ────────────────────────────────────────────────────────────
export const subscriptionService = new SubscriptionService(
  subscriptionRepository,
  stripeService,
  planRepository
);

// ── Controllers ───────────────────────────────────────────────────────────────
export const webhookController = new WebhookController(
  stripeService,
  subscriptionService,
  planRepository
);

export const paymentController = new PaymentController(
  stripeService,
  planRepository,
  subscriptionService
);

export const subscriptionController = new SubscriptionController(
  subscriptionService
);

// ── Middlewares ───────────────────────────────────────────────────────────────
export const subscriptionMiddleware = new SubscriptionMiddleware(
  subscriptionService,
  planRepository
);

// ── Cron Jobs ─────────────────────────────────────────────────────────────────
export const subscriptionCronJobs = new SubscriptionCronJobs(
  subscriptionRepository
);
