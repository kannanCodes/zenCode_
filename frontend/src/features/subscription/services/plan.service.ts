import api from '../../../shared/lib/axios';
import type { Plan } from '../types/subscription.types';

interface PlansResponse {
  success: boolean;
  message: string;
  data: Plan[];
}

export const planService = {
  /**
   * Fetches all active plans from the backend.
   * GET /api/plans
   */
  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get<PlansResponse>('/plans');
    return response.data.data;
  },
};
