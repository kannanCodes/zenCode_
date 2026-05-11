import { IProblem } from "../../../infrastructure/database/models/problem.model";
import { CreateProblemInput, UpdateProblemInput } from "../../../dtos/problem/problem.dto";

export interface IProblemRepository {
  createProblem(data: CreateProblemInput & { createdBy: string }): Promise<IProblem>;
  findByTitle(title: string): Promise<IProblem | null>;
  findById(problemId: string): Promise<IProblem | null>;
  listProblems(filters: Record<string, unknown>, skip: number, limit: number, sort: Record<string, 1 | -1>): Promise<{ problems: IProblem[]; total: number }>;
  updateById(problemId: string, data: UpdateProblemInput): Promise<IProblem | null>;
  softDeleteById(problemId: string): Promise<IProblem | null>;
  getDistinctTags(): Promise<string[]>;
  getCompanyTagStats(): Promise<{ name: string; count: number }[]>;
}
