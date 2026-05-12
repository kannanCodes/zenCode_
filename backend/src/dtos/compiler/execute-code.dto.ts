import { SupportedLanguage } from "../../constants/compiler.constants";

export interface ExecuteCodeDto {
  language: SupportedLanguage;
  sourceCode: string;
  stdin?: string;
  problemId?: string;
  testCases?: Array<{ input: string; output: string; isHidden: boolean }>;
  functionSignature?: {
    functionName: string;
    parameters: Array<{ name: string; type: string }>;
    returnType: string;
  };
  isSubmission?: boolean;
}

export interface TestCaseResultDto {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
}

export interface ExecutionResultDto {
  stdout: string | null;
  stderr: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
  compile_output: string | null;
  testResults?: TestCaseResultDto[];
}
