import { Request, Response, NextFunction } from "express";
import { IMentorAvailabilityService } from "../../interfaces/service-interfaces/mentor/IMentorAvailabilityService";
import { sendSuccess } from "../../shared/http/response";
import { STATUS_CODES } from "../../shared/constants/status";
import { AVAILABILITY_MESSAGES } from "../../constants/messages";
import { AuthenticatedRequest } from "../../shared/types/authenticated-request";

export class MentorAvailabilityController {
  constructor(private readonly availabilityService: IMentorAvailabilityService) {}

  upsertAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mentorId = (req as AuthenticatedRequest).user.id;
      const availability = await this.availabilityService.upsertAvailability(mentorId, req.body);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: AVAILABILITY_MESSAGES.UPDATED,
        data: availability,
      });
    } catch (error) {
      next(error);
    }
  };

  getMyAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mentorId = (req as AuthenticatedRequest).user.id;
      const availability = await this.availabilityService.getMyAvailability(mentorId);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: AVAILABILITY_MESSAGES.FETCHED,
        data: availability,
      });
    } catch (error) {
      next(error);
    }
  };

  getMentorAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const availability = await this.availabilityService.getMentorAvailability(req.params.mentorId as string);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: AVAILABILITY_MESSAGES.FETCHED,
        data: availability,
      });
    } catch (error) {
      next(error);
    }
  };
}
