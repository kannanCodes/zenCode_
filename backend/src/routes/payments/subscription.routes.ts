import { Router } from "express";
import { subscriptionController } from "../../shared/di/payment.container";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, subscriptionController.getMySubscription);
router.delete("/cancel", authMiddleware, subscriptionController.cancelSubscription);
router.patch("/change-plan", authMiddleware, subscriptionController.changePlan);

export default router;
