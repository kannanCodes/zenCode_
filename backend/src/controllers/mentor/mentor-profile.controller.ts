import { Request, Response, NextFunction } from "express";
import { IMentorProfileService } from "../../interfaces/service-interfaces/mentor/IMentorProfileService";
import { AuthenticatedRequest } from "../../shared/types/authenticated-request";
import { sendSuccess } from "../../shared/http/response";
import { STATUS_CODES } from "../../shared/constants/status";
import { MENTOR_MESSAGES, STORAGE_MESSAGES } from "../../constants/messages";

export class MentorProfileController {
  constructor(private readonly mentorProfileService: IMentorProfileService) {}

  getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mentorId = (req as AuthenticatedRequest).user.id;
      const profile = await this.mentorProfileService.getMyProfile(mentorId);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: MENTOR_MESSAGES.PROFILE_FETCHED,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  updateMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mentorId = (req as AuthenticatedRequest).user.id;
      const profile = await this.mentorProfileService.updateMyProfile(mentorId, req.body);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: MENTOR_MESSAGES.PROFILE_UPDATED,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  generateAvatarUploadUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mentorId = (req as AuthenticatedRequest).user.id;
      const uploadData = await this.mentorProfileService.generateAvatarUploadUrl(mentorId, req.body);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: STORAGE_MESSAGES.AVATAR_UPLOAD_URL_GENERATED,
        data: uploadData,
      });
    } catch (error) {
      next(error);
    }
  };
}
