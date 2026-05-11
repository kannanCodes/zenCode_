export interface ExampleInput {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCaseInput {
  input: string;
  output: string;
  isHidden?: boolean;
}

export interface ParameterInput {
  name: string;
  type: string;
}

export interface FunctionSignatureInput {
  functionName: string;
  parameters: ParameterInput[];
  returnType: string;
}

export interface StarterCodeInput {
  javascript?: string;
  python?: string;
  java?: string;
  cpp?: string;
  c?: string;
  csharp?: string;
  go?: string;
  rust?: string;
  typescript?: string;
}

export interface CreateProblemInput {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  companyTags?: string[];
  constraints?: string;
  examples?: ExampleInput[];
  starterCode?: StarterCodeInput;
  functionSignature: FunctionSignatureInput;
  testCases: TestCaseInput[];
  supportedLanguages?: string[];
  isPremium?: boolean;
}

export interface UpdateProblemInput {
  title?: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
  companyTags?: string[];
  constraints?: string;
  examples?: ExampleInput[];
  starterCode?: StarterCodeInput;
  functionSignature?: FunctionSignatureInput;
  testCases?: TestCaseInput[];
  supportedLanguages?: string[];
  isPremium?: boolean;
  isActive?: boolean;
}

export interface ListProblemsQuery {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: "easy" | "medium" | "hard";
  tag?: string;
  isPremium?: boolean;
  isActive?: boolean;
  sortBy?: "createdAt" | "difficulty" | "title";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedProblemsResponse {
  data: unknown[]; // Will be IProblem[] or partial
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
