import { Request, Response, NextFunction } from 'express';
import { IPlanService } from '../../interfaces/service-interfaces/admin/IPlanService';
import { sendSuccess } from '../../shared/http/response';
import { STATUS_CODES } from '../../shared/constants/status';
import { PLAN_MESSAGES } from '../../constants/messages';

export class AdminPlanController {
  constructor(private readonly planService: IPlanService) {}

  createPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plan = await this.planService.createPlan(req.body);
      return sendSuccess(res, {
        statusCode: STATUS_CODES.CREATED,
        message: PLAN_MESSAGES.CREATED,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  };

  updatePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plan = await this.planService.updatePlan(req.params.id as string, req.body);
      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: PLAN_MESSAGES.UPDATED,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  };

  getAdminPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plans = await this.planService.getPlansForAdmin();
      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: PLAN_MESSAGES.FETCHED,
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  };

  getActivePlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plans = await this.planService.getActivePlans();
      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: PLAN_MESSAGES.FETCHED,
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  };

  togglePlanStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plan = await this.planService.togglePlanStatus(req.params.id as string);
      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: PLAN_MESSAGES.STATUS_UPDATED,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  };
}
