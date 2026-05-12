import { ICompilerService } from "../../interfaces/service-interfaces/compiler/ICompilerService";
import { IDockerExecutionService } from "../../interfaces/infrastructure-interfaces/execution/IDockerExecutionService";
import { IProblemRepository } from "../../interfaces/repository-interfaces/problem/IProblemRepository";
import { ICacheService } from "../../interfaces/service-interfaces/auth/ICacheService";
import { ExecuteCodeDto, ExecutionResultDto } from "../../dtos/compiler/execute-code.dto";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import crypto from "crypto";
import { ITestCase } from "../../infrastructure/database/models/problem.model";
import { logger } from "../../shared/utils/Logger";

export class CompilerService implements ICompilerService {
  constructor(
    private readonly dockerService: IDockerExecutionService,
    private readonly problemRepository: IProblemRepository,
    private readonly cacheService: ICacheService
  ) {}

  async createExecution(input: ExecuteCodeDto): Promise<{ token: string }> {
    let executionData = { ...input };

    if (input.problemId) {
      const problem = await this.problemRepository.findById(input.problemId);
      if (problem) {
        // Use test cases from problem if problemId is provided
        const testCases = input.isSubmission
          ? problem.testCases
          : (problem.testCases as ITestCase[]).filter((tc: ITestCase) => !tc.isHidden);

        executionData = {
          ...executionData,
          testCases,
          functionSignature: problem.functionSignature,
        };
      }
    }

    const result = await this.dockerService.executeCode(executionData);
    
    // Generate a unique token for polling
    const token = `exec_${crypto.randomBytes(16).toString("hex")}`;
    
    // Store in cache with 5 minute TTL
    await this.cacheService.set(token, result, 300);
    
    logger.info(`Execution created successfully with token: ${token}`);
    
    return { token };
  }

  async getExecutionResult(token: string): Promise<ExecutionResultDto> {
    const result = await this.cacheService.get<ExecutionResultDto>(token);
    
    if (!result) {
      throw new AppError("Execution result not found or expired", STATUS_CODES.NOT_FOUND);
    }
    
    // Clean up after retrieval (one-time poll)
    await this.cacheService.del(token);
    
    return result;
  }
}
