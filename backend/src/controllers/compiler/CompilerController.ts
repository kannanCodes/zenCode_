import { Request, Response, NextFunction } from 'express';
import { ICompilerService } from '../../interfaces/service-interfaces/compiler/ICompilerService';
import { sendSuccess } from '../../shared/http/response';
import { STATUS_CODES } from '../../shared/constants/status';
import { logger } from '../../shared/utils/Logger';

export class CompilerController {
  constructor(private readonly compilerService: ICompilerService) {}

  executeCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info(`Code execution request received for language: ${req.body.language}`);
      const result = await this.compilerService.createExecution(req.body);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: 'Execution started',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.compilerService.getExecutionResult(req.params.token);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: 'Execution result',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
