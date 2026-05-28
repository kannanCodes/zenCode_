import { Types } from 'mongoose';
import { BaseRepository } from '../../infrastructure/database/repositories/base/base.repository';
import { INotification, Notification } from '../../infrastructure/database/models/notification.model';
import { INotificationRepository } from '../../interfaces/repository-interfaces/notification/INotificationRepository';
import { NotificationQueryDto } from '../../dtos/notification/notification-query.dto';
import { NOTIFICATION_CONFIG } from '../../constants/notification.constants';

export class NotificationRepository
  extends BaseRepository<INotification>
  implements INotificationRepository
{
  constructor() {
    super(Notification);
  }

  async findByRecipient(recipientId: string, query: NotificationQueryDto): Promise<INotification[]> {
    const page  = query.page  ?? 1;
    const limit = query.limit ?? NOTIFICATION_CONFIG.DEFAULT_PAGE_SIZE;
    const skip  = (page - 1) * limit;

    return this.model
      .find({ recipientId: new Types.ObjectId(recipientId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countUnread(recipientId: string): Promise<number> {
    return this.model.countDocuments({
      recipientId: new Types.ObjectId(recipientId),
      isRead: false,
    });
  }

  async markAsRead(notificationId: string, recipientId: string): Promise<INotification | null> {
    return this.model
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(notificationId),
          recipientId: new Types.ObjectId(recipientId),
        },
        { $set: { isRead: true } },
        { new: true }
      )
      .exec();
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await this.model.updateMany(
      { recipientId: new Types.ObjectId(recipientId), isRead: false },
      { $set: { isRead: true } }
    );
  }

  async findByDedupeKey(dedupeKey: string): Promise<INotification | null> {
    return this.findOne({ dedupeKey });
  }
}
