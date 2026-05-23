import { Request, Response, NextFunction } from "express";
import { IMentorSlotService } from "../../interfaces/service-interfaces/mentor/IMentorSlotService";
import { sendSuccess } from "../../shared/http/response";
import { STATUS_CODES } from "../../shared/constants/status";
import { SLOT_MESSAGES } from "../../constants/messages";
import { AppError } from "../../shared/utils/AppError";

export class MentorSlotController {
  constructor(private readonly slotService: IMentorSlotService) {}

  getMentorSlots = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mentorId = req.params.mentorId as string;
      const date = req.query.date as string | undefined;
      const startDate = (req.query.startDate as string | undefined) || date;
      const endDate = (req.query.endDate as string | undefined) || date;

      if (!startDate || !endDate) {
        throw new AppError(SLOT_MESSAGES.START_DATE_REQUIRED, STATUS_CODES.BAD_REQUEST);
      }

      const slots = await this.slotService.getMentorSlots(mentorId, startDate, endDate);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: SLOT_MESSAGES.FETCHED,
        data: slots,
      });
    } catch (error) {
      next(error);
    }
  };
}
