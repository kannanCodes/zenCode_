import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../../services/dashboard/DashboardService';
import { sendSuccess } from '../../shared/http/response';
import { STATUS_CODES } from '../../shared/constants/status';
import { AuthenticatedRequest } from '../../shared/types/authenticated-request';

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const data = await this.dashboardService.getDashboard(userId);
      sendSuccess(res, { statusCode: STATUS_CODES.OK, data });
    } catch (err) {
      next(err);
    }
  };
}
