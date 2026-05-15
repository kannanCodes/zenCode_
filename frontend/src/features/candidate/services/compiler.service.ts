import api from '../../../shared/lib/axios';

export type SupportedLanguage = 'javascript' | 'python';
export type StarterCode = Partial<Record<SupportedLanguage, string>>;

interface ExecuteCodeInput {
     language: SupportedLanguage;
     sourceCode: string;
     stdin?: string;
     problemId?: string;
}

interface ExecutionResult {
     stdout: string | null;
     stderr: string | null;
     compile_output: string | null;
     status: {
          id: number;
          description: string;
     };
     time: string | null;
     memory: number | null;
     testResults?: {
          input: string;
          expectedOutput: string;
          actualOutput: string;
          passed: boolean;
          error?: string;
     }[];
}

export const compilerService = {
     executeCode: async (input: ExecuteCodeInput): Promise<{ token: string }> => {
          const response = await api.post('/compiler/execute', input);
          return response.data.data;
     },

     getResult: async (token: string): Promise<ExecutionResult> => {
          const response = await api.get(`/compiler/result/${token}`);
          return response.data.data;
     },

     pollResult: async (token: string, maxAttempts = 20): Promise<ExecutionResult> => {
          for (let i = 0; i < maxAttempts; i++) {
               const result = await compilerService.getResult(token);

               // Status 1 = In Queue, 2 = Processing
               if (result.status.id > 2) {
                    return result;
               }

               await new Promise(resolve => setTimeout(resolve, 500));
          }

          throw new Error('Execution timeout');
     },
};

export type { ExecuteCodeInput, ExecutionResult };