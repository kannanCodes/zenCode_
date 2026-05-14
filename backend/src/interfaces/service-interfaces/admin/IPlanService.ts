import { IPlanDocument } from '../../../infrastructure/database/models/plan.model';
import { CreatePlanInput, UpdatePlanInput } from '../../../dtos/admin/admin-plan.dto';

export interface IPlanService {
  createPlan(data: CreatePlanInput): Promise<IPlanDocument>;
  updatePlan(planId: string, data: UpdatePlanInput): Promise<IPlanDocument>;
  getPlansForAdmin(): Promise<IPlanDocument[]>;
  getActivePlans(): Promise<IPlanDocument[]>;
  getPlanById(planId: string): Promise<IPlanDocument>;
  getPlanByStripePriceId(priceId: string): Promise<IPlanDocument>;
  togglePlanStatus(planId: string): Promise<IPlanDocument>;
}
