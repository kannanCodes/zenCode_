import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/response";
import { logger } from "../utils/Logger";
import { STATUS_CODES } from "../constants/status";
import { GLOBAL_MESSAGES } from "../constants/messages";


export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {

     logger.error("Error caught", err);

     if (err instanceof AppError) {
          return sendError(res, err.message, err.statusCode);
     }

     return sendError(res, GLOBAL_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);


};