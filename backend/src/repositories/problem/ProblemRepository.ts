import ProblemModel, { IProblem } from "../../infrastructure/database/models/problem.model";
import { BaseRepository } from "../base/BaseRepository";
import { IProblemRepository } from "../../interfaces/repository-interfaces/problem/IProblemRepository";
import { CreateProblemInput, UpdateProblemInput } from "../../dtos/problem/problem.dto";

export class ProblemRepository extends BaseRepository<IProblem> implements IProblemRepository {
  constructor() {
    super(ProblemModel);
  }

  async createProblem(data: CreateProblemInput & { createdBy: string }): Promise<IProblem> {
    return this.model.create(data);
  }

  async findByTitle(title: string): Promise<IProblem | null> {
    return this.model.findOne({ title }).exec();
  }

  async listProblems(filters: Record<string, unknown>, skip: number, limit: number, sort: Record<string, 1 | -1>): Promise<{ problems: IProblem[]; total: number }> {
    const [problems, total] = await Promise.all([
      this.model.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("-testCases")
        .exec(),
      this.model.countDocuments(filters).exec()
    ]);

    return { problems, total };
  }

  async updateById(problemId: string, data: UpdateProblemInput): Promise<IProblem | null> {
    return this.model.findByIdAndUpdate(
      problemId,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  }

  async softDeleteById(problemId: string): Promise<IProblem | null> {
    return this.model.findByIdAndUpdate(
      problemId,
      { $set: { isActive: false } },
      { new: true }
    ).exec();
  }

  async getDistinctTags(): Promise<string[]> {
    const tags = await this.model.distinct("tags");
    return (tags as string[]).filter(Boolean).sort();
  }

  async getCompanyTagStats(): Promise<{ name: string; count: number }[]> {
    return this.model.aggregate([
      { $match: { isActive: true } },
      { $unwind: "$companyTags" },
      { $group: { _id: "$companyTags", count: { $sum: 1 } } },
      { $project: { name: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1, name: 1 } }
    ]);
  }
}
