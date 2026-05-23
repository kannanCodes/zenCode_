import { Router } from "express";
import { candidateMentorController } from "../../shared/di/candidate.container";

const router = Router();

// Candidates discovering public mentors (Unauthenticated or authenticated depending on business rule, assuming public or Candidate only)
// Based on typical systems, discovering mentors is public, but let's just make it public.
router.get(
  "/",
  candidateMentorController.getMentors.bind(candidateMentorController)
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
