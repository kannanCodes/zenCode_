import { ISubmission } from "../../infrastructure/database/models/submission.model";

export interface CreateSubmissionInput {
  problemId: string;
  language: "python" | "javascript";
  sourceCode: string;
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  data: ISubmission | ISubmission[] | null;
}
