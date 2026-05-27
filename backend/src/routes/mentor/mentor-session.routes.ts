import { Router } from "express";
import { mentorSessionController } from "../../shared/di/mentor.container";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  mentorSessionController.createSession
);

router.get(
  "/:roomId/validate",
  authMiddleware,
  mentorSessionController.validateSessionAccess
);

router.get(
  "/:roomId/workspace",
  authMiddleware,
  mentorSessionController.getWorkspace
);

router.get(
  "/:roomId/problems",
  authMiddleware,
  mentorSessionController.listWorkspaceProblems
);

router.patch(
  "/:roomId/problem",
  authMiddleware,
  mentorSessionController.selectWorkspaceProblem
);

router.patch(
  "/:roomId/end",
  authMiddleware,
  mentorSessionController.endSession
);

export default router;
