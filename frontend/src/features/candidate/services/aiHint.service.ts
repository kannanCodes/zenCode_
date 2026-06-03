import api from '../../../shared/lib/axios';
import type { AiHintResponse, AiHintStatusResponse } from '../types/ai-hint.types';

export const aiHintService = {
  getStatus: async (problemId: string): Promise<AiHintStatusResponse> => {
    const response = await api.get<{ success: boolean; data: AiHintStatusResponse }>(
      `/ai-hints/${problemId}/status`,
      // Panel handles all its own error states (403, 4xx) — suppress global toast
      { suppressGlobalErrorToast: true }
    );
    return response.data.data;
  },

  getHint: async (problemId: string): Promise<AiHintResponse> => {
    const response = await api.post<{ success: boolean; data: AiHintResponse }>(
      `/ai-hints/${problemId}`,
      {},
      // Panel renders its own error UI (inline card + retry button) — suppress global toast
      { suppressGlobalErrorToast: true }
    );
    return response.data.data;
  },
};
