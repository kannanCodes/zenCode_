import { ISubmission } from "../../../infrastructure/database/models/submission.model";

export interface ISubmissionRepository {
  create(data: Partial<ISubmission>): Promise<ISubmission>;
  findById(id: string): Promise<ISubmission | null>;
  update(id: string, data: Partial<ISubmission>): Promise<ISubmission | null>;
  listByUser(userId: string): Promise<ISubmission[]>;
}
