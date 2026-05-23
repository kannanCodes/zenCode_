import { CandidateMentorRepository } from "../../repositories/candidate/CandidateMentorRepository";
import { CandidateMentorService } from "../../services/candidate/CandidateMentorService";
import { CandidateMentorController } from "../../controllers/candidate/CandidateMentorController";
import { mentorAvailabilityRepository, mentorReviewRepository } from "./mentor.container";

// ── Repositories ───────────────────────────────────────────────────────────────
export const candidateMentorRepository = new CandidateMentorRepository();

// ── Domain Services ────────────────────────────────────────────────────────────
export const candidateMentorService = new CandidateMentorService(
  candidateMentorRepository,
  mentorAvailabilityRepository,
  mentorReviewRepository
);

// ── Controller ─────────────────────────────────────────────────────────────────
export const candidateMentorController = new CandidateMentorController(candidateMentorService);
