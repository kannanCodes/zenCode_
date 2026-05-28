import { Request, Response, NextFunction } from 'express';
import { IAdminRevenueService } from '../../interfaces/service-interfaces/admin/IAdminRevenueService';
import { sendSuccess } from '../../shared/http/response';
import { STATUS_CODES } from '../../shared/constants/status';

export class AdminRevenueController {
  constructor(private readonly _revenueService: IAdminRevenueService) {}

  async getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this._revenueService.getMetrics();
      sendSuccess(res, { statusCode: STATUS_CODES.OK, data });
    } catch (error) {
      next(error);
    }
  }

  async getTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query.days as string, 10) || 30;
      const data = await this._revenueService.getTrend(days);
      sendSuccess(res, { statusCode: STATUS_CODES.OK, data });
    } catch (error) {
      next(error);
    }
  }

  async getPlanPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this._revenueService.getPlanPerformance();
      sendSuccess(res, { statusCode: STATUS_CODES.OK, data });
    } catch (error) {
      next(error);
    }
  }

  async getRecentPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const data = await this._revenueService.getRecentPayments(page, limit);
      sendSuccess(res, { statusCode: STATUS_CODES.OK, data });
    } catch (error) {
      next(error);
    }
  }
}
