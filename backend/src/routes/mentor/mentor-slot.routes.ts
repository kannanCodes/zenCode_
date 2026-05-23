import { Router } from "express";
import { mentorSlotController } from "../../shared/di/mentor.container";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateQuery } from "../../middlewares/validate.middleware";
import { getSlotsValidator } from "../../validators/mentor/get-slots.validator";

const router = Router();

router.get(
  "/:mentorId",
  authMiddleware,
  validateQuery(getSlotsValidator),
  mentorSlotController.getMentorSlots
);

export default router;
