import { Router } from "express";
import { candidateMentorController } from "../../shared/di/candidate.container";
import { validateQuery } from "../../middlewares/validate.middleware";
import { listCandidateMentorsQuerySchema } from "../../validators/candidate/candidate-mentor.validator";

const router = Router();

// Candidates discovering public mentors (Unauthenticated or authenticated depending on business rule, assuming public or Candidate only)
// Based on typical systems, discovering mentors is public, but let's just make it public.
router.get(
  "/",
  validateQuery(listCandidateMentorsQuerySchema),
  candidateMentorController.getMentors.bind(candidateMentorController)
);

router.get(
  "/skills",
  candidateMentorController.getMentorSkills.bind(candidateMentorController)
);

router.get(
  "/:mentorId",
  candidateMentorController.getMentorDetails.bind(candidateMentorController)
);

router.get(
  "/:mentorId/availability",
  candidateMentorController.getMentorAvailability.bind(candidateMentorController)
);

router.get(
  "/:mentorId/reviews",
  candidateMentorController.getMentorReviews.bind(candidateMentorController)
);

export default router;
