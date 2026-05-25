import { ProblemRepository } from "../../repositories/problem/ProblemRepository";
import { ProblemService } from "../../services/problem/ProblemService";
import { ProblemController } from "../../controllers/problem/ProblemController";
import { subscriptionService } from "./payment.container";

// ── Repositories ───────────────────────────────────────────────────────────────
export const problemRepository = new ProblemRepository();

// ── Domain Services ────────────────────────────────────────────────────────────
export const problemService = new ProblemService(problemRepository, subscriptionService);

// ── Controller ─────────────────────────────────────────────────────────────────
export const problemController = new ProblemController(problemService);
