import { INotification } from '../../../infrastructure/database/models/notification.model';
import { CreateNotificationDto } from '../../../dtos/notification/create-notification.dto';
import { NotificationQueryDto } from '../../../dtos/notification/notification-query.dto';

export interface INotificationService {
  
  create(dto: CreateNotificationDto): Promise<INotification | null>;

  getNotifications(recipientId: string, query: NotificationQueryDto): Promise<INotification[]>;

  getUnreadCount(recipientId: string): Promise<number>;

  markAsRead(notificationId: string, recipientId: string): Promise<INotification | null>;

  markAllAsRead(recipientId: string): Promise<void>;
}
