import { Request, Response, NextFunction } from 'express';
import { IAiHintService } from '../../interfaces/service-interfaces/ai-hint/IAiHintService';
import { STATUS_CODES } from '../../shared/constants/status';

export class AiHintController {
  constructor(private readonly aiHintService: IAiHintService) {}

  getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { problemId } = req.params as { problemId: string };

      const result = await this.aiHintService.getStatus(userId, problemId);

      res.status(STATUS_CODES.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  generate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { problemId } = req.params as { problemId: string };

      const result = await this.aiHintService.generateHint(userId, problemId);

      res.status(STATUS_CODES.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
