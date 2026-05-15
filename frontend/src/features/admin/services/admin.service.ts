import api from "../../../shared/lib/axios";
import { type StarterCode } from "../../candidate/services/compiler.service";

interface CreateMentorData {
     fullName: string;
     email: string;
     expertise: string[];
     experienceLevel: 'junior' | 'mid' | 'senior';
}

interface LoginResponse {
     success: boolean;
     message: string;
     data: {
          accessToken: string;
     };
}

interface UserListQuery {
     page?: number;
     limit?: number;
     search?: string;
     isBlocked?: boolean;
     sortBy?: 'createdAt' | 'lastActiveDate' | 'email';
     sortOrder?: 'asc' | 'desc';
}

interface ProblemListQuery {
     page?: number;
     limit?: number;
     search?: string;
     difficulty?: 'easy' | 'medium' | 'hard';
     tag?: string;
     isPremium?: boolean;
     isActive?: boolean;
     sortBy?: 'createdAt' | 'difficulty' | 'title';
     sortOrder?: 'asc' | 'desc';
}

interface ExampleInput {
     input: string;
     output: string;
     explanation?: string;
}

interface TestCaseInput {
     input: string;
     output: string;
     isHidden?: boolean;
}

interface ParameterInput {
     name: string;
     type: string;
}

interface FunctionSignatureInput {
     functionName: string;
     parameters: ParameterInput[];
     returnType: string;
}

interface StarterCodeInput extends StarterCode {}

export interface CreateProblemInput {
     title: string;
     description: string;
     difficulty: 'easy' | 'medium' | 'hard';
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

interface UpdateProblemInput {
     title?: string;
     description?: string;
     difficulty?: 'easy' | 'medium' | 'hard';
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

interface MentorListQuery {
     page?: number;
     limit?: number;
     status?: 'INVITED' | 'ACTIVE' | 'DISABLED';
     experienceLevel?: 'junior' | 'mid' | 'senior';
     expertise?: string;
     search?: string;
     sortBy?: string;
     sortOrder?: 'asc' | 'desc';
}


export const adminService = {
     login: async (data: { email: string; password: string }): Promise<LoginResponse['data']> => {
          const response = await api.post<LoginResponse>('/admin/auth/login', data);
          return response.data.data;
     },

     createMentor: async (data: CreateMentorData) => {
          const response = await api.post('/admin/mentors', data);
          return response.data;
     },

     listMentors: async (query: MentorListQuery = {}) => {
          const response = await api.get('/admin/mentors', { params: query });
          return response.data.data;
     },

     updateMentorStatus: async (mentorId: string, status: 'ACTIVE' | 'DISABLED') => {
          const response = await api.patch(`/admin/mentors/${mentorId}/status`, { status });
          return response.data;
     },

     resendInvite: async (mentorId: string) => {
          const response = await api.post(`/admin/mentors/${mentorId}/resend-invite`);
          return response.data;
     },


     listUsers: async (query: UserListQuery = {}) => {
          const response = await api.get('/admin/users', { params: query });
          return response.data;
     },

     blockUser: async (userId: string) => {
          const response = await api.patch(`/admin/users/${userId}/block`);
          return response.data;
     },

     unblockUser: async (userId: string) => {
          const response = await api.patch(`/admin/users/${userId}/unblock`);
          return response.data;
     },


     listProblems: async (query: ProblemListQuery = {}) => {
          const response = await api.get('/problems/admin', { params: query });
          return response.data.data;
     },

     getProblemTags: async (): Promise<string[]> => {
          const response = await api.get<{ data: string[] }>('/problems/tags');
          return response.data.data ?? [];
     },

     getProblem: async (problemId: string) => {
          const response = await api.get(`/problems/${problemId}`);
          return response.data;
     },

     createProblem: async (data: CreateProblemInput) => {
          const response = await api.post('/problems', data);
          return response.data;
     },

     updateProblem: async (problemId: string, data: UpdateProblemInput) => {
          const response = await api.patch(`/problems/${problemId}`, data);
          return response.data;
     },

     deleteProblem: async (problemId: string) => {
          const response = await api.delete(`/problems/${problemId}`);
          return response.data;
     },
};