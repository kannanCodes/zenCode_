import { Request, Response, NextFunction } from "express";
import { IMentorSlotService } from "../../interfaces/service-interfaces/mentor/IMentorSlotService";
import { sendSuccess } from "../../shared/http/response";
import { STATUS_CODES } from "../../shared/constants/status";
import { SLOT_MESSAGES } from "../../constants/messages";

export class MentorSlotController {
  constructor(private readonly slotService: IMentorSlotService) {}

  getMentorSlots = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mentorId = req.params.mentorId as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

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
