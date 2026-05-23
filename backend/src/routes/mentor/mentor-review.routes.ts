import { Router } from "express";
import { mentorReviewController } from "../../shared/di/mentor.container";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleGuard } from "../../middlewares/role.middleware";
import { UserRole } from "../../shared/constants/roles";

const router = Router();

// POST /api/mentor-reviews  → Candidate submits review after session ends
router.post(
  "/",
  authMiddleware,
  roleGuard(UserRole.CANDIDATE),
  mentorReviewController.createReview
);

// GET /api/mentor-reviews/mentor/:mentorId → Anyone can view public reviews of a mentor
router.get(
  "/mentor/:mentorId",
  mentorReviewController.getMentorPublicReviews
);

export default router;
