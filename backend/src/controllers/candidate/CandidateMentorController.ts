import { Request, Response, NextFunction } from "express";
import { ICandidateMentorService } from "../../interfaces/service-interfaces/candidate/ICandidateMentorService";
import { sendError, sendSuccess } from "../../shared/http/response";
import { STATUS_CODES } from "../../shared/constants/status";
import { AVAILABILITY_MESSAGES, MENTOR_MESSAGES } from "../../constants/messages";
import { ListCandidateMentorsQuery } from "../../dtos/candidate/candidate-mentor.dto";

export class CandidateMentorController {
  constructor(private readonly candidateMentorService: ICandidateMentorService) {}

  async getMentors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.validatedQuery as ListCandidateMentorsQuery;
      const mentors = await this.candidateMentorService.getMentors(query);
      sendSuccess(res, { statusCode: STATUS_CODES.OK, data: mentors });
    } catch (error) {
      next(error);
    }
  }

  async getMentorSkills(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const skills = await this.candidateMentorService.getMentorSkills();
      sendSuccess(res, { statusCode: STATUS_CODES.OK, data: skills });
    } catch (error) {
      next(error);
    }
  }

  async getMentorDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mentorId = req.params.mentorId as string;
      const mentor = await this.candidateMentorService.getMentorDetails(mentorId);
      if (!mentor) {
        sendError(res, MENTOR_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
        return;
      }
      sendSuccess(res, { statusCode: STATUS_CODES.OK, data: mentor });
    } catch (error) {
      next(error);
    }
  }

  async getMentorAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mentorId = req.params.mentorId as string;
      const availability = await this.candidateMentorService.getMentorAvailability(mentorId);
      if (!availability) {
        sendError(res, AVAILABILITY_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
        return;
      }
      sendSuccess(res, { statusCode: STATUS_CODES.OK, data: availability });
    } catch (error) {
      next(error);
    }
  }

  async getMentorReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mentorId = req.params.mentorId as string;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 5;

      const paginatedReviews = await this.candidateMentorService.getMentorPublicReviews(mentorId, page, limit);
      sendSuccess(res, { statusCode: STATUS_CODES.OK, data: paginatedReviews });
    } catch (error) {
      next(error);
    }
  }
}
