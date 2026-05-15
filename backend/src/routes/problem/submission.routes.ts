import { Router } from "express";
import { submissionController } from "../../shared/di/submission.container";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate.middleware";
import { createSubmissionSchema } from "../../validators/problem/submission.validator";

const router = Router();

router.post(
  "/",
  authMiddleware,
  validateRequest(createSubmissionSchema),
  submissionController.submit
);

router.get("/me", authMiddleware, submissionController.getMySubmissions);
router.get("/:id", authMiddleware, submissionController.getSubmission);

export default router;
