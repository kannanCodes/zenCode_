import api from '../lib/axios';
import type { ExecutionResult, SupportedLanguage } from '../../features/candidate/services/compiler.service';
import type { Problem } from '../../features/candidate/services/problem.service';

export interface SessionEditorState {
  code: string;
  language: SupportedLanguage;
  version: number;
}

export interface SessionWorkspace {
  session: unknown;
  problem: Problem | null;
  editorState: SessionEditorState;
  lastRunResult?: ExecutionResult;
  lastRunError?: string;
}

export const sessionWorkspaceService = {
  getWorkspace: async (roomId: string): Promise<SessionWorkspace> => {
    const response = await api.get<{ data: SessionWorkspace }>(`/mentor-sessions/${roomId}/workspace`);
    return response.data.data;
  },

  listProblems: async (roomId: string, search = ''): Promise<Problem[]> => {
    const response = await api.get<{ data: Problem[] }>(`/mentor-sessions/${roomId}/problems`, {
      params: { search, limit: 10 },
    });
    return response.data.data;
  },

  selectProblem: async (roomId: string, problemId: string): Promise<SessionWorkspace> => {
    const response = await api.patch<{ data: SessionWorkspace }>(`/mentor-sessions/${roomId}/problem`, {
      problemId,
    });
    return response.data.data;
  },
};
