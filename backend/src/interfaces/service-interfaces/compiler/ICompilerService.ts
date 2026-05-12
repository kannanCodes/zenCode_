import { ExecuteCodeDto, ExecutionResultDto } from "../../../dtos/compiler/execute-code.dto";

export interface ICompilerService {
  createExecution(input: ExecuteCodeDto): Promise<{ token: string }>;
  getExecutionResult(token: string): Promise<ExecutionResultDto>;
}
