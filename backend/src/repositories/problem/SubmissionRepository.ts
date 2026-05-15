import { BaseRepository } from "../../infrastructure/database/repositories/base/base.repository";
import { ISubmission, Submission } from "../../infrastructure/database/models/submission.model";
import { ISubmissionRepository } from "../../interfaces/repository-interfaces/problem/ISubmissionRepository";

export class SubmissionRepository extends BaseRepository<ISubmission> implements ISubmissionRepository {
  constructor() {
    super(Submission);
  }

  async create(data: Partial<ISubmission>): Promise<ISubmission> {
    return super.create(data);
  }

  async findById(id: string): Promise<ISubmission | null> {
    return super.findById(id);
  }

  async listByUser(userId: string): Promise<ISubmission[]> {
    return this.model.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async update(id: string, data: Partial<ISubmission>): Promise<ISubmission | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}
