import { Request, Response, NextFunction } from "express";
import { IMentorReviewService } from "../../interfaces/service-interfaces/mentor/IMentorReviewService";
import { sendSuccess } from "../../shared/http/response";
import { STATUS_CODES } from "../../shared/constants/status";
import { AuthenticatedRequest } from "../../shared/types/authenticated-request";
import { REVIEW_MESSAGES } from "../../constants/messages";

export class MentorReviewController {
  constructor(private readonly reviewService: IMentorReviewService) {}

  createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = (req as AuthenticatedRequest).user.id;
      const review = await this.reviewService.createReview(studentId, req.body);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.CREATED,
        message: REVIEW_MESSAGES.SUBMITTED,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

  getMentorPublicReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mentorId = req.params.mentorId as string;
      const reviews = await this.reviewService.getMentorPublicReviews(mentorId);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: REVIEW_MESSAGES.FETCHED,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  };

  getReviewByBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = (req as AuthenticatedRequest).user.id;
      const { bookingId } = req.params as { bookingId: string };
      const hasReviewed = await this.reviewService.hasStudentReviewedBooking(studentId, bookingId);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        data: { hasReviewed },
      });
    } catch (error) {
      next(error);
    }
  };
}
