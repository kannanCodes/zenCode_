import { ProblemRepository } from "../../repositories/problem/ProblemRepository";
import { DockerExecutionService } from "../../infrastructure/execution/DockerExecutionService";
import { CompilerService } from "../../services/compiler/CompilerService";
import { CompilerController } from "../../controllers/compiler/CompilerController";
import { cacheService } from "./shared.container";

// ── Repositories ───────────────────────────────────────────────────────────────
const problemRepository = new ProblemRepository();

// ── Infrastructure Services ────────────────────────────────────────────────────
const dockerExecutionService = new DockerExecutionService();

// ── Domain Services ────────────────────────────────────────────────────────────
export const compilerService = new CompilerService(
  dockerExecutionService,
  problemRepository,
  cacheService
);

// ── Controller ─────────────────────────────────────────────────────────────────
export const compilerController = new CompilerController(compilerService);
