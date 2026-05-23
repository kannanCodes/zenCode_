import { Request, Response, NextFunction } from "express";
import { IMentorSessionService } from "../../interfaces/service-interfaces/mentor/IMentorSessionService";
import { sendSuccess } from "../../shared/http/response";
import { STATUS_CODES } from "../../shared/constants/status";
import { AuthenticatedRequest } from "../../shared/types/authenticated-request";
import { SESSION_MESSAGES } from "../../constants/messages";

export class MentorSessionController {
  constructor(private readonly sessionService: IMentorSessionService) {}

  createSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const session = await this.sessionService.createSession(req.body, userId);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.CREATED,
        message: SESSION_MESSAGES.CREATED,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  validateSessionAccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const session = await this.sessionService.validateSessionAccess(req.params.roomId as string, userId);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: SESSION_MESSAGES.VALIDATED,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  endSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const session = await this.sessionService.endSession(req.params.roomId as string, userId);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: SESSION_MESSAGES.ENDED,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };
}
