import { ExecuteCodeDto, ExecutionResultDto } from "../../../dtos/compiler/execute-code.dto";

export interface IDockerExecutionService {
  executeCode(input: ExecuteCodeDto): Promise<ExecutionResultDto>;
}
