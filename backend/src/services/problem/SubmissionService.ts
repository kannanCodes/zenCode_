import { ISubmissionService } from "../../interfaces/service-interfaces/problem/ISubmissionService";
import { ISubmissionRepository } from "../../interfaces/repository-interfaces/problem/ISubmissionRepository";
import { ICompilerService } from "../../interfaces/service-interfaces/compiler/ICompilerService";
import { IProblemRepository } from "../../interfaces/repository-interfaces/problem/IProblemRepository";
import { CreateSubmissionInput } from "../../dtos/problem/submission.dto";
import { ExecutionResultDto, TestCaseResultDto } from "../../dtos/compiler/execute-code.dto";
import { ISubmission, SubmissionStatus, ITestResult } from "../../infrastructure/database/models/submission.model";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { SUBMISSION_MESSAGES, PROBLEM_MESSAGES } from "../../constants/messages";
import { SUBMISSION_CONSTANTS } from "../../constants/submission.constants";
import { Types } from "mongoose";

export class SubmissionService implements ISubmissionService {
  constructor(
    private readonly _submissionRepo: ISubmissionRepository,
    private readonly _compilerService: ICompilerService,
    private readonly _problemRepo: IProblemRepository
  ) {}

  async submitSolution(userId: string, data: CreateSubmissionInput): Promise<ISubmission> {
    const problem = await this._problemRepo.findById(data.problemId);

    if (!problem) {
      throw new AppError(PROBLEM_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    // Step 1: Create submission record
    const submission = await this._submissionRepo.create({
      userId: new Types.ObjectId(userId),
      problemId: new Types.ObjectId(data.problemId),
      language: data.language,
      sourceCode: data.sourceCode,
      status: SubmissionStatus.RUNNING,
    });

    try {
      // Step 2: Execute code via CompilerService
      const execution = await this._compilerService.createExecution({
        language: data.language,
        sourceCode: data.sourceCode,
        problemId: data.problemId,
        isSubmission: true,
      });

      // Step 3: Poll for result
      let result: ExecutionResultDto | undefined;
      let attempts = 0;
      const maxAttempts = SUBMISSION_CONSTANTS.POLLING_ATTEMPTS;

      while (attempts < maxAttempts) {
        try {
          result = await this._compilerService.getExecutionResult(execution.token);
          break;
        } catch (error: unknown) {
          const err = error as { statusCode?: number };
          // If result not found in cache yet, wait and retry
          if (err.statusCode === STATUS_CODES.NOT_FOUND && attempts < maxAttempts - 1) {
            await new Promise((resolve) => setTimeout(resolve, SUBMISSION_CONSTANTS.POLLING_INTERVAL_MS));
            attempts++;
          } else {
            throw error;
          }
        }
      }

      if (!result) {
        throw new AppError(SUBMISSION_MESSAGES.TIMEOUT, STATUS_CODES.REQUEST_TIMEOUT);
      }

      // Step 4: Determine final status
      let status = SubmissionStatus.ACCEPTED;

      if (result.compile_output) {
        status = SubmissionStatus.COMPILATION_ERROR;
      } else if (result.stderr) {
        status = SubmissionStatus.RUNTIME_ERROR;
      } else if (result.testResults?.some((t: TestCaseResultDto) => !t.passed)) {
        status = SubmissionStatus.WRONG_ANSWER;
      }

      // Step 5: Update submission with results
      const updated = await this._submissionRepo.update(String(submission._id), {
        status,
        stdout: result.stdout || undefined,
        stderr: result.stderr || undefined,
        compile_output: result.compile_output || undefined,
        time: result.time || undefined,
        memory: result.memory || undefined,
        testResults: result.testResults ? (result.testResults as ITestResult[]) : [],
      });

      return updated!;
    } catch (error: unknown) {
      const err = error as Error;
      // Handle failures by updating submission status to Error
      await this._submissionRepo.update(String(submission._id), {
        status: SubmissionStatus.RUNTIME_ERROR,
        stderr: err.message,
      });

      throw error;
    }
  }

  async getSubmission(id: string): Promise<ISubmission> {
    const submission = await this._submissionRepo.findById(id);

    if (!submission) {
      throw new AppError(SUBMISSION_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    return submission;
  }

  async getUserSubmissions(userId: string): Promise<ISubmission[]> {
    return this._submissionRepo.listByUser(userId);
  }
}
