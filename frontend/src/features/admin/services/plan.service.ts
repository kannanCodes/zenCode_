import api from '../../../shared/lib/axios';

export interface PlanFeature {
     name: string;
     description?: string;
     enabled: boolean;
}

export interface PlanAccess {
     mentorBooking: boolean;
     premiumProblems: boolean;
     aiHints: boolean;
}

export interface Plan {
     _id: string;
     name: string;
     price: number;
     billingCycle: 'monthly' | 'yearly';
     intervalCount: number;
     durationInDays: number;
     description: string;
     features: PlanFeature[];
     access: PlanAccess;
     stripeProductId: string;
     stripePriceId: string;
     isActive: boolean;
     isArchived: boolean;
     createdAt: string;
     updatedAt: string;
}

export interface CreatePlanInput {
     name: string;
     price: number;
     billingCycle: 'monthly' | 'yearly';
     intervalCount: number;
     description: string;
     features: PlanFeature[];
     access: PlanAccess;
     stripeProductId: string;
     stripePriceId: string;
}

export interface UpdatePlanInput {
     name?: string;
     price?: number;
     billingCycle?: 'monthly' | 'yearly';
     intervalCount?: number;
     description?: string;
     features?: PlanFeature[];
     access?: Partial<PlanAccess>;
     stripeProductId?: string;
     stripePriceId?: string;
     isActive?: boolean;
}

export const planService = {
     // Admin endpoints
     createPlan: async (data: CreatePlanInput): Promise<Plan> => {
          const response = await api.post<{ data: Plan }>('/plans', data);
          return response.data.data;
     },

     updatePlan: async (id: string, data: UpdatePlanInput): Promise<Plan> => {
          const response = await api.patch<{ data: Plan }>(`/plans/${id}`, data);
          return response.data.data;
     },

     getAdminPlans: async (): Promise<Plan[]> => {
          const response = await api.get<{ data: Plan[] }>('/plans/admin');
          return response.data.data;
     },

     togglePlanStatus: async (id: string): Promise<Plan> => {
          const response = await api.patch<{ data: Plan }>(`/plans/${id}/toggle-status`);
          return response.data.data;
     },

     // Public endpoint
     getActivePlans: async (): Promise<Plan[]> => {
          const response = await api.get<{ data: Plan[] }>('/plans');
          return response.data.data;
     },
};