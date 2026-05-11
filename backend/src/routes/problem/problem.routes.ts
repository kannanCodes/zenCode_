import { Router } from "express";
import { problemController } from "../../shared/di/problem.container";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleGuard } from "../../middlewares/role.middleware";
import { UserRole } from "../../shared/constants/roles";
import { validateRequest } from "../../middlewares/validate.middleware";
import { createProblemValidator, updateProblemValidator } from "../../validators/problem/problem.validator";

const router = Router();

// Problem creation (Admin only)
router.post(
  "/",
  authMiddleware,
  roleGuard(UserRole.ADMIN),
  validateRequest(createProblemValidator),
  problemController.createProblem
);

// Admin listing
router.get(
  "/admin",
  authMiddleware,
  roleGuard(UserRole.ADMIN),
  problemController.listProblems
);

// Tags (Both)
router.get(
  "/tags",
  authMiddleware,
  roleGuard(UserRole.ADMIN, UserRole.CANDIDATE),
  problemController.getProblemTags
);

// Company Tags (Both)
router.get(
  "/company-tags",
  authMiddleware,
  roleGuard(UserRole.ADMIN, UserRole.CANDIDATE),
  problemController.getProblemCompanyTags
);

// Get Problem (Both)
router.get(
  "/:id",
  authMiddleware,
  roleGuard(UserRole.ADMIN, UserRole.CANDIDATE),
  problemController.getProblem
);

// Update Problem (Admin only)
router.patch(
  "/:id",
  authMiddleware,
  roleGuard(UserRole.ADMIN),
  validateRequest(updateProblemValidator),
  problemController.updateProblem
);

// Delete Problem (Admin only)
router.delete(
  "/:id",
  authMiddleware,
  roleGuard(UserRole.ADMIN),
  problemController.deleteProblem
);

// Candidate listing
router.get(
  "/",
  authMiddleware,
  roleGuard(UserRole.CANDIDATE),
  problemController.listCandidateProblems
);

export default router;
