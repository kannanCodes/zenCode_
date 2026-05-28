import { Request, Response, NextFunction } from 'express';
import { INotificationService } from '../../interfaces/service-interfaces/notification/INotificationService';
import { AuthenticatedRequest } from '../../shared/types/authenticated-request';
import { sendSuccess } from '../../shared/http/response';
import { STATUS_CODES } from '../../shared/constants/status';
import { NOTIFICATION_MESSAGES } from '../../constants/messages';
import { parseNotificationQuery } from '../../dtos/notification/notification-query.dto';
import { AppError } from '../../shared/utils/AppError';

export class NotificationController {
  constructor(private readonly notificationService: INotificationService) {}

  /**
   * GET /api/notifications
   * Returns paginated notifications for the authenticated user.
   */
  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const query  = parseNotificationQuery(req.query as Record<string, unknown>);

      const notifications = await this.notificationService.getNotifications(userId, query);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: NOTIFICATION_MESSAGES.FETCHED,
        data: notifications,
        meta: { page: query.page, limit: query.limit },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/notifications/unread-count
   * Returns the unread notification count for the authenticated user.
   */
  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const count  = await this.notificationService.getUnreadCount(userId);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: NOTIFICATION_MESSAGES.UNREAD_COUNT_FETCHED,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/notifications/:id/read
   * Marks a single notification as read.
   */
  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId         = (req as AuthenticatedRequest).user.id;
      const notificationId = String(req.params.id);

      const notification = await this.notificationService.markAsRead(notificationId, userId);

      if (!notification) {
        throw new AppError(NOTIFICATION_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
      }

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: NOTIFICATION_MESSAGES.MARKED_READ,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/notifications/read-all
   * Marks all notifications for the authenticated user as read.
   */
  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      await this.notificationService.markAllAsRead(userId);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: NOTIFICATION_MESSAGES.MARKED_ALL_READ,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };
}
