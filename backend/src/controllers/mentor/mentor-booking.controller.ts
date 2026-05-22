import { Request, Response, NextFunction } from "express";
import { IMentorBookingService } from "../../interfaces/service-interfaces/mentor/IMentorBookingService";
import { sendSuccess } from "../../shared/http/response";
import { STATUS_CODES } from "../../shared/constants/status";
import { AuthenticatedRequest } from "../../shared/types/authenticated-request";
import { BOOKING_MESSAGES } from "../../constants/messages";

export class MentorBookingController {
  constructor(private readonly bookingService: IMentorBookingService) {}

  createBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = (req as AuthenticatedRequest).user.id;
      const booking = await this.bookingService.createBooking(studentId, req.body);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.CREATED,
        message: BOOKING_MESSAGES.CREATED,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  };

  getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = (req as AuthenticatedRequest).user.id;
      const bookings = await this.bookingService.getMyBookings(studentId);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: BOOKING_MESSAGES.FETCHED,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  };

  getMentorBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mentorId = (req as AuthenticatedRequest).user.id;
      const bookings = await this.bookingService.getMentorBookings(mentorId);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: BOOKING_MESSAGES.MENTOR_FETCHED,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  };

  cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const booking = await this.bookingService.cancelBooking(req.params.id as string, userId);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: BOOKING_MESSAGES.CANCELLED,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  };
}
