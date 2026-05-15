import { Request, Response, NextFunction } from "express";
import { ISubmissionService } from "../../interfaces/service-interfaces/problem/ISubmissionService";
import { sendSuccess } from "../../shared/http/response";
import { STATUS_CODES } from "../../shared/constants/status";
import { SUBMISSION_MESSAGES } from "../../constants/messages";
import { UserRole } from "../../shared/constants/roles";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
}

export class SubmissionController {
  constructor(private readonly _submissionService: ISubmissionService) {}

  submit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const result = await this._submissionService.submitSolution(authReq.user.id, req.body);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: SUBMISSION_MESSAGES.EXECUTED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._submissionService.getSubmission(req.params.id as string);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: SUBMISSION_MESSAGES.FETCHED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getMySubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const result = await this._submissionService.getUserSubmissions(authReq.user.id);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: SUBMISSION_MESSAGES.FETCHED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
