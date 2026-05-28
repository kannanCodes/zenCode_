import { Request, Response, NextFunction } from 'express';
import { IAdminDashboardService } from '../../interfaces/service-interfaces/admin/IAdminDashboardService';
import { sendSuccess } from '../../shared/http/response';
import { STATUS_CODES } from '../../shared/constants/status';

export class AdminDashboardController {
  constructor(private readonly _dashboardService: IAdminDashboardService) {}

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this._dashboardService.getStats();
      sendSuccess(res, { statusCode: STATUS_CODES.OK, data });
    } catch (error) {
      next(error);
    }
  }

  async getActivityFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const data = await this._dashboardService.getActivityFeed(limit);
      sendSuccess(res, { statusCode: STATUS_CODES.OK, data });
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this._dashboardService.getAnalytics();
      sendSuccess(res, { statusCode: STATUS_CODES.OK, data });
    } catch (error) {
      next(error);
    }
  }

  async getPendingActions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this._dashboardService.getPendingActions();
      sendSuccess(res, { statusCode: STATUS_CODES.OK, data });
    } catch (error) {
      next(error);
    }
  }
}
