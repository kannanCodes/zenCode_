import { Request, Response, NextFunction } from 'express';
import { IMessageService } from '../../interfaces/service-interfaces/chat/IMessageService';
import { sendSuccess } from '../../shared/http/response';
import { STATUS_CODES } from '../../shared/constants/status';

export class MessageController {
  constructor(private readonly messageService: IMessageService) {}

  getRoomMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomId = req.params.roomId as string;
      const messages = await this.messageService.getRoomMessages(roomId);

      return sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: 'Messages fetched successfully',
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  };
}
