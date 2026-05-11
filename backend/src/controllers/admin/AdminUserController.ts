import { Request, Response, NextFunction } from 'express';
import { IAdminUserService } from "../../interfaces/service-interfaces/admin/IAdminUserService";
import { sendSuccess } from "../../shared/http/response";
import { STATUS_CODES } from "../../shared/constants/status";
import { ListUsersQuery } from "../../dtos/admin/admin-user.dto";
import { UserRole } from "../../shared/constants/roles";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
  validatedQuery?: unknown;
}

export class AdminUserController {
  constructor(private readonly _service: IAdminUserService) {}

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req as AuthenticatedRequest).validatedQuery as ListUsersQuery;
      const result = await this._service.listCandidates(query);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        data: result.users,
        meta: {
          total: result.total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async blockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = req.params.userId as string;

      await this._service.blockUser(user.id, userId);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: 'User blocked successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  async unblockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId as string;
      await this._service.unblockUser(userId);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: 'User unblocked successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}
