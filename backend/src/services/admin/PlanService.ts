import { IPlanService } from '../../interfaces/service-interfaces/admin/IPlanService';
import { IPlanRepository } from '../../interfaces/repository-interfaces/admin/IPlanRepository';
import { IStripeService } from '../../interfaces/service-interfaces/payments/stripe.service.interface';
import { CreatePlanInput, UpdatePlanInput } from '../../dtos/admin/admin-plan.dto';
import { IPlanDocument } from '../../infrastructure/database/models/plan.model';
import { AppError } from '../../shared/utils/AppError';
import { STATUS_CODES } from '../../shared/constants/status';
import { PLAN_MESSAGES, GLOBAL_MESSAGES } from '../../constants/messages';

export class PlanService implements IPlanService {
  constructor(
    private readonly planRepo: IPlanRepository,
    private readonly stripeService: IStripeService
  ) {}

  async createPlan(data: CreatePlanInput): Promise<IPlanDocument> {
    const existingPlan = await this.planRepo.findByName(data.name);

    if (existingPlan) {
      throw new AppError(PLAN_MESSAGES.ALREADY_EXISTS, STATUS_CODES.CONFLICT);
    }

    const stripeData = await this.stripeService.createProductAndPrice({
      name: data.name,
      description: data.description,
      price: data.price,
      billingCycle: data.billingCycle,
      intervalCount: data.intervalCount || 1,
    });

    try {
      const unitDays = data.billingCycle === 'monthly' ? 30 : 365;
      const durationInDays = unitDays * (data.intervalCount || 1);

      return await this.planRepo.createPlan({
        ...data,
        durationInDays,
        stripeProductId: stripeData.productId,
        stripePriceId: stripeData.priceId,
      });
    } catch (error) {
      // Rollback: archive the product in Stripe if DB creation fails
      await this.stripeService.archiveProduct(stripeData.productId);
      throw error;
    }
  }

  async updatePlan(planId: string, data: UpdatePlanInput): Promise<IPlanDocument> {
    const plan = await this.planRepo.findById(planId);

    if (!plan) {
      throw new AppError(PLAN_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    if (data.name && data.name !== plan.name) {
      const existingPlan = await this.planRepo.findByName(data.name);
      if (existingPlan) {
        throw new AppError(PLAN_MESSAGES.ALREADY_EXISTS, STATUS_CODES.CONFLICT);
      }
    }

    let updatedData = { ...data };
    if (data.billingCycle || data.intervalCount) {
      const billingCycle = data.billingCycle || plan.billingCycle;
      const intervalCount = data.intervalCount !== undefined ? data.intervalCount : plan.intervalCount;
      const unitDays = billingCycle === 'monthly' ? 30 : 365;
      Object.assign(updatedData, { durationInDays: unitDays * intervalCount });
    }

    const updatedPlan = await this.planRepo.updatePlanById(planId, updatedData);

    if (!updatedPlan) {
      throw new AppError(GLOBAL_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    return updatedPlan;
  }

  async getPlansForAdmin(): Promise<IPlanDocument[]> {
    return this.planRepo.listAll();
  }

  async getActivePlans(): Promise<IPlanDocument[]> {
    return this.planRepo.listActive();
  }

  async getPlanById(planId: string): Promise<IPlanDocument> {
    const plan = await this.planRepo.findById(planId);

    if (!plan) {
      throw new AppError(PLAN_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    return plan;
  }

  async getPlanByStripePriceId(priceId: string): Promise<IPlanDocument> {
    const plan = await this.planRepo.findByStripePriceId(priceId);
    if (!plan) {
      throw new AppError(PLAN_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }
    return plan;
  }

  async togglePlanStatus(planId: string): Promise<IPlanDocument> {
    const plan = await this.planRepo.findById(planId);

    if (!plan) {
      throw new AppError(PLAN_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    const updatedPlan = await this.planRepo.updatePlanById(planId, { isActive: !plan.isActive });

    if (!updatedPlan) {
      throw new AppError(GLOBAL_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    return updatedPlan;
  }
}
