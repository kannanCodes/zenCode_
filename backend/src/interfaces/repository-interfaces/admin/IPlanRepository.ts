import { IPlanDocument } from '../../../infrastructure/database/models/plan.model';
import { CreatePlanInput, UpdatePlanInput } from '../../../dtos/admin/admin-plan.dto';

export interface IPlanRepository {
  createPlan(data: CreatePlanInput & { durationInDays: number, stripeProductId: string, stripePriceId: string }): Promise<IPlanDocument>;
  findByName(name: string): Promise<IPlanDocument | null>;
  findById(id: string): Promise<IPlanDocument | null>;
  listActive(): Promise<IPlanDocument[]>;
  listAll(): Promise<IPlanDocument[]>;
  findByStripePriceId(priceId: string): Promise<IPlanDocument | null>;
  updatePlanById(id: string, data: UpdatePlanInput): Promise<IPlanDocument | null>;
}
