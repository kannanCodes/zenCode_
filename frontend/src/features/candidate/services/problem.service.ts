import api from '../../../shared/lib/axios';

export interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  companyTags?: string[];
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints?: string;
  functionSignature?: {
    functionName: string;
    parameters: Array<{ name: string; type: string }>;
    returnType: string;
  };
  starterCode?: {
    javascript?: string;
    python?: string;
    java?: string;
    cpp?: string;
    c?: string;
    csharp?: string;
    go?: string;
    rust?: string;
    typescript?: string;
  };
  testCases?: Array<{
    input: string;
    output: string;
    isHidden?: boolean;
  }>;
  supportedLanguages?: string[];
  isPremium: boolean;
}

interface ProblemListQuery {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tag?: string;
  isPremium?: boolean;
  sortBy?: 'createdAt' | 'difficulty' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export const candidateProblemService = {
  listProblems: async (query: ProblemListQuery = {}) => {
    const response = await api.get('/problems', { params: query });
    return response.data;
  },

  getProblem: async (problemId: string) => {
    const response = await api.get(`/problems/${problemId}`);
    return response.data;
  },

  getTags: async (): Promise<string[]> => {
    const response = await api.get('/problems/tags');
    return response.data.data || [];
  },

  getCompanyTags: async (): Promise<{ name: string; count: number }[]> => {
    const response = await api.get('/problems/company-tags');
    return response.data.data || [];
  },
};

export type { ProblemListQuery };
