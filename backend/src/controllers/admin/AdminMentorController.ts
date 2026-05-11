import { Request, Response, NextFunction } from 'express';
import { IAdminMentorService } from "../../interfaces/service-interfaces/admin/IAdminMentorService";
import { sendSuccess } from "../../shared/http/response";
import { STATUS_CODES } from "../../shared/constants/status";
import { ListMentorsQuery } from "../../dtos/admin/admin-mentor.dto";
import { UserRole } from "../../shared/constants/roles";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
  validatedQuery?: unknown;
}

export class AdminMentorController {
  constructor(private readonly _adminMentorService: IAdminMentorService) {}

  async createMentor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const adminId = user.id;

      await this._adminMentorService.createMentor(adminId, req.body);

      sendSuccess(res, {
        statusCode: STATUS_CODES.CREATED,
        message: 'Mentor invite sent successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMentorStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mentorId = req.params.mentorId as string;
      const { user } = req as AuthenticatedRequest;
      const adminId = user.id;
      const { status } = req.body;

      await this._adminMentorService.updateMentorStatus(mentorId, status, adminId);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: 'Mentor status updated',
      });
    } catch (error) {
      next(error);
    }
  }

  async listMentors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req as AuthenticatedRequest).validatedQuery as ListMentorsQuery;
      const result = await this._adminMentorService.listMentors(query);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async resendMentorInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mentorId = req.params.mentorId as string;

      await this._adminMentorService.resendMentorInvite(mentorId);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: 'Mentor invite resent successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
