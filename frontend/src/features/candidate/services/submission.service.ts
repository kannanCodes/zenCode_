import api from '../../../shared/lib/axios';

export interface SubmitCodeInput {
  problemId: string;
  language: string;
  sourceCode: string;
}

export interface Submission {
  _id: string;
  userId: string;
  problemId: string;
  language: string;
  sourceCode: string;
  status: 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'runtime_error' | 'compilation_error';
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  time?: string;
  memory?: number;
  testResults?: Array<{
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    error?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const submissionService = {
  submit: async (input: SubmitCodeInput): Promise<Submission> => {
    const response = await api.post<{ data: Submission }>('/submissions', input);
    return response.data.data;
  },

  getMySubmissions: async (): Promise<Submission[]> => {
    const response = await api.get<{ data: Submission[] }>('/submissions/me');
    return response.data.data;
  },

  getSubmission: async (id: string): Promise<Submission> => {
    const response = await api.get<{ data: Submission }>(`/submissions/${id}`);
    return response.data.data;
  },
};
