import { IProblemService } from "../../interfaces/service-interfaces/problem/IProblemService";
import { IProblemRepository } from "../../interfaces/repository-interfaces/problem/IProblemRepository";
import { CreateProblemInput, UpdateProblemInput, ListProblemsQuery, PaginatedProblemsResponse } from "../../dtos/problem/problem.dto";
import { IProblem, ITestCase } from "../../infrastructure/database/models/problem.model";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { PROBLEM_MESSAGES } from "../../constants/messages";

export class ProblemService implements IProblemService {
  constructor(private readonly _problemRepository: IProblemRepository) {}

  async createProblem(adminId: string, data: CreateProblemInput): Promise<IProblem> {
    const existingProblem = await this._problemRepository.findByTitle(data.title);
    if (existingProblem) {
      throw new AppError(PROBLEM_MESSAGES.TITLE_EXISTS, STATUS_CODES.CONFLICT);
    }
    return this._problemRepository.createProblem({
      ...data,
      createdBy: adminId
    });
  }

  async listProblems(query: ListProblemsQuery): Promise<PaginatedProblemsResponse> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filters: Record<string, unknown> = {};

    if (query.search) {
      filters.$or = [
        { title: { $regex: query.search, $options: "i" } },
        { tags: { $regex: query.search, $options: "i" } }
      ];
    }

    if (query.difficulty) {
      filters.difficulty = query.difficulty;
    }

    if (query.tag) {
      filters.tags = query.tag;
    }

    if (query.isPremium !== undefined) {
      filters.isPremium = query.isPremium;
    }

    if (query.isActive !== undefined) {
      filters.isActive = query.isActive;
    }

    const sort: Record<string, 1 | -1> = {
      [(query.sortBy || "createdAt") as string]: query.sortOrder === "asc" ? 1 : -1
    };

    const { problems, total } = await this._problemRepository.listProblems(filters, skip, limit, sort);

    return {
      data: problems,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getProblemById(problemId: string): Promise<IProblem> {
    const problem = await this._problemRepository.findById(problemId);
    if (!problem) {
      throw new AppError(PROBLEM_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }
    return problem;
  }

  async updateProblem(problemId: string, data: UpdateProblemInput): Promise<IProblem> {
    const problem = await this._problemRepository.updateById(problemId, data);
    if (!problem) {
      throw new AppError(PROBLEM_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }
    return problem;
  }

  async getDistinctTags(): Promise<string[]> {
    return this._problemRepository.getDistinctTags();
  }

  async getDistinctCompanyTags(): Promise<{ name: string; count: number }[]> {
    return this._problemRepository.getCompanyTagStats();
  }

  async deleteProblem(problemId: string): Promise<IProblem> {
    const problem = await this._problemRepository.softDeleteById(problemId);
    if (!problem) {
      throw new AppError(PROBLEM_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }
    return problem;
  }

  async listCandidateProblems(query: ListProblemsQuery): Promise<PaginatedProblemsResponse> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filters: Record<string, unknown> = {
      isActive: true
    };

    if (query.search) {
      filters.title = { $regex: query.search, $options: "i" };
    }

    if (query.difficulty) {
      filters.difficulty = query.difficulty;
    }

    if (query.tag) {
      filters.$or = [
        { tags: query.tag },
        { companyTags: query.tag }
      ];
    }

    if (query.isPremium !== undefined) {
      filters.isPremium = query.isPremium;
    }

    const sort: Record<string, 1 | -1> = {
      [(query.sortBy || "createdAt") as string]: query.sortOrder === "asc" ? 1 : -1
    };

    const { problems, total } = await this._problemRepository.listProblems(filters, skip, limit, sort);

    return {
      data: problems,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getCandidateProblem(problemId: string): Promise<Partial<IProblem>> {
    const problem = await this._problemRepository.findById(problemId);
    if (!problem || !problem.isActive) {
      throw new AppError(PROBLEM_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    const problemObj = problem.toObject();

    // Filter test cases - only return non-hidden ones
    const publicTestCases = (problemObj.testCases as ITestCase[])?.filter((tc) => !tc.isHidden) || [];

    return {
      ...problemObj,
      testCases: publicTestCases
    };
  }
}
