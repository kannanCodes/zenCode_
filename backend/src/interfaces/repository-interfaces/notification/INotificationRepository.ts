import { INotification } from '../../../infrastructure/database/models/notification.model';
import { BaseRepository } from '../../../infrastructure/database/repositories/base/base.repository';
import { NotificationQueryDto } from '../../../dtos/notification/notification-query.dto';

export interface INotificationRepository extends BaseRepository<INotification> {
  
  findByRecipient(recipientId: string, query: NotificationQueryDto): Promise<INotification[]>;

  countUnread(recipientId: string): Promise<number>;

  markAsRead(notificationId: string, recipientId: string): Promise<INotification | null>;

  
  markAllAsRead(recipientId: string): Promise<void>;

  findByDedupeKey(dedupeKey: string): Promise<INotification | null>;
}
