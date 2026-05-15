import { SubmissionRepository } from "../../repositories/problem/SubmissionRepository";
import { SubmissionService } from "../../services/problem/SubmissionService";
import { SubmissionController } from "../../controllers/problem/SubmissionController";
import { compilerService } from "./compiler.container";
import { problemRepository } from "./problem.container";

// ── Repositories ───────────────────────────────────────────────────────────────
export const submissionRepository = new SubmissionRepository();

// ── Domain Services ────────────────────────────────────────────────────────────
export const submissionService = new SubmissionService(
  submissionRepository,
  compilerService,
  problemRepository
);

// ── Controller ─────────────────────────────────────────────────────────────────
export const submissionController = new SubmissionController(submissionService);
