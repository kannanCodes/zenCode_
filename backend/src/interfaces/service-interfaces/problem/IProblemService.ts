import { CreateProblemInput, UpdateProblemInput, ListProblemsQuery, PaginatedProblemsResponse } from "../../../dtos/problem/problem.dto";
import { IProblem } from "../../../infrastructure/database/models/problem.model";

export interface IProblemService {
  createProblem(adminId: string, data: CreateProblemInput): Promise<IProblem>;
  listProblems(query: ListProblemsQuery): Promise<PaginatedProblemsResponse>;
  getProblemById(problemId: string): Promise<IProblem>;
  updateProblem(problemId: string, data: UpdateProblemInput): Promise<IProblem>;
  getDistinctTags(): Promise<string[]>;
  getDistinctCompanyTags(): Promise<{ name: string; count: number }[]>;
  deleteProblem(problemId: string): Promise<IProblem>;
  listCandidateProblems(query: ListProblemsQuery): Promise<PaginatedProblemsResponse>;
  getCandidateProblem(problemId: string, userId: string): Promise<Partial<IProblem>>;
}
