import cron from "node-cron";
import { ISubscriptionRepository } from "../../interfaces/repository-interfaces/payments/ISubscriptionRepository";
import { logger } from "../../shared/utils/Logger";

export class SubscriptionCronJobs {
  constructor(private readonly subscriptionRepo: ISubscriptionRepository) {}

  /**
   * Runs daily at midnight (00:00).
   * Marks any active subscriptions whose endDate has passed as 'expired'.
   * This is a safety net — Stripe webhooks handle real-time updates,
   * but this catches any edge cases or missed webhooks.
   */
  start() {
    cron.schedule("0 0 * * *", async () => {
      try {
        await this.subscriptionRepo.expireOldSubscriptions();
        logger.info("[CRON] Expired subscriptions updated successfully.");
      } catch (error) {
        logger.error("[CRON] Failed to expire subscriptions:", error instanceof Error ? error.message : "Unknown error");
      }
    });

    logger.info("[CRON] Subscription jobs registered");
  }
}
