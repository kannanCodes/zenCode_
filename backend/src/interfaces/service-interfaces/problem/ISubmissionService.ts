import { CreateSubmissionInput } from "../../../dtos/problem/submission.dto";
import { ISubmission } from "../../../infrastructure/database/models/submission.model";

export interface ISubmissionService {
  submitSolution(userId: string, data: CreateSubmissionInput): Promise<ISubmission>;
  getSubmission(id: string): Promise<ISubmission>;
  getUserSubmissions(userId: string): Promise<ISubmission[]>;
}
