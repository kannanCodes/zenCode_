import { BaseRepository } from '../../infrastructure/database/repositories/base/base.repository';
import Plan, { IPlanDocument } from '../../infrastructure/database/models/plan.model';
import { IPlanRepository } from '../../interfaces/repository-interfaces/admin/IPlanRepository';
import { CreatePlanInput, UpdatePlanInput } from '../../dtos/admin/admin-plan.dto';
import mongoose from 'mongoose';

export class PlanRepository extends BaseRepository<IPlanDocument> implements IPlanRepository {
  constructor() {
    super(Plan);
  }

  async createPlan(data: CreatePlanInput & { durationInDays: number, stripeProductId: string, stripePriceId: string }): Promise<IPlanDocument> {
    return this.create(data);
  }

  async findByName(name: string): Promise<IPlanDocument | null> {
    return this.findOne({ name, isArchived: false });
  }

  async listActive(): Promise<IPlanDocument[]> {
    return this.model.find({ isActive: true, isArchived: false }).sort({ price: 1 }).exec();
  }

  async listAll(): Promise<IPlanDocument[]> {
    return this.model.find({ isArchived: false }).sort({ createdAt: -1 }).exec();
  }

  async findByStripePriceId(priceId: string): Promise<IPlanDocument | null> {
    return this.findOne({ stripePriceId: priceId, isArchived: false });
  }

  async updatePlanById(id: string, data: UpdatePlanInput): Promise<IPlanDocument | null> {
    return this.updateOne({ _id: id, isArchived: false } as mongoose.QueryFilter<IPlanDocument>, { $set: data });
  }
}
