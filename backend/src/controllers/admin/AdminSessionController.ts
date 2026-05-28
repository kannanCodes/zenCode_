import { Request, Response, NextFunction } from 'express';
import { IAdminSessionService } from '../../interfaces/service-interfaces/admin/IAdminSessionService';
import { sendSuccess } from '../../shared/http/response';
import { STATUS_CODES } from '../../shared/constants/status';
import { AdminSessionQueryDto } from '../../dtos/admin/admin-session.dto';

export class AdminSessionController {
  constructor(private readonly _sessionService: IAdminSessionService) {}

  async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: AdminSessionQueryDto = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        status: req.query.status as any,
        search: req.query.search as string,
      };

      const data = await this._sessionService.getSessions(query);
      sendSuccess(res, { statusCode: STATUS_CODES.OK, data });
    } catch (error) {
      next(error);
    }
  }

  async getSessionDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const data = await this._sessionService.getSessionDetails(id);
      sendSuccess(res, { statusCode: STATUS_CODES.OK, data });
    } catch (error) {
      next(error);
    }
  }
}
