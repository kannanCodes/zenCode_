import { Types } from 'mongoose';
import { INotificationService } from '../../interfaces/service-interfaces/notification/INotificationService';
import { INotificationRepository } from '../../interfaces/repository-interfaces/notification/INotificationRepository';
import { IEmailService } from '../../interfaces/service-interfaces/auth/IEmailService';
import { INotification } from '../../infrastructure/database/models/notification.model';
import { CreateNotificationDto } from '../../dtos/notification/create-notification.dto';
import { NotificationQueryDto } from '../../dtos/notification/notification-query.dto';
import { NOTIFICATION_EVENTS } from '../../infrastructure/websocket/socket.events';
import { getIo } from '../../infrastructure/websocket/socket.server';
import { presenceStore } from '../../infrastructure/websocket/presence.store';
import { logger } from '../../shared/utils/Logger';

export class NotificationService implements INotificationService {
  constructor(
    private readonly notificationRepo: INotificationRepository,
    private readonly emailService: IEmailService
  ) {}

 
  async create(dto: CreateNotificationDto): Promise<INotification | null> {
    // ── 1. Idempotency check ─────────────────────────────────────────────────
    if (dto.dedupeKey) {
      const existing = await this.notificationRepo.findByDedupeKey(dto.dedupeKey);
      if (existing) {
        logger.info(`[Notification] Duplicate skipped — dedupeKey: ${dto.dedupeKey}`);
        return null;
      }
    }

    // ── 2. Persist to DB ─────────────────────────────────────────────────────
    const notification = await this.notificationRepo.create({
      recipientId: new Types.ObjectId(dto.recipientId),
      type: dto.type,
      title: dto.title,
      message: dto.message,
      data: dto.data,
      isRead: false,
      ...(dto.dedupeKey && { dedupeKey: dto.dedupeKey }),
    });

    // ── 3. Emit to all active sockets for this user (multi-tab safe) ─────────
    try {
      const io = getIo();
      const socketIds = presenceStore.getUserSockets(dto.recipientId);

      const payload = {
        _id:       notification._id,
        type:      notification.type,
        title:     notification.title,
        message:   notification.message,
        data:      notification.data,
        isRead:    notification.isRead,
        createdAt: notification.createdAt,
      };

      if (socketIds.length > 0) {
        // Target each socket directly for per-user isolation
        socketIds.forEach((socketId) => {
          io.to(socketId).emit(NOTIFICATION_EVENTS.NEW_NOTIFICATION, payload);
        });
        logger.info(`[Notification] Emitted to ${socketIds.length} socket(s) for user ${dto.recipientId}`);
      }
    } catch (err) {
      // Socket delivery failure must NEVER affect the booking response
      logger.warn('[Notification] Socket emission failed (non-fatal):', err);
    }

    // ── 4. Fire-and-forget email ──────────────────────────────────────────────
    if (dto.recipientEmail && dto.recipientName) {
      void this.sendEmailSafely(dto);
    }

    return notification;
  }

  async getNotifications(recipientId: string, query: NotificationQueryDto): Promise<INotification[]> {
    return this.notificationRepo.findByRecipient(recipientId, query);
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    return this.notificationRepo.countUnread(recipientId);
  }

  async markAsRead(notificationId: string, recipientId: string): Promise<INotification | null> {
    return this.notificationRepo.markAsRead(notificationId, recipientId);
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    return this.notificationRepo.markAllAsRead(recipientId);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Wraps email sending in a try/catch so failures are logged but never bubble up.
   */
  private async sendEmailSafely(dto: CreateNotificationDto): Promise<void> {
    try {
      if (
        dto.recipientEmail &&
        dto.recipientName &&
        dto.mentorName &&
        dto.candidateName &&
        dto.sessionStartTime &&
        dto.sessionEndTime &&
        dto.data?.bookingId
      ) {
        await this.emailService.sendBookingConfirmation({
          to: dto.recipientEmail,
          recipientName: dto.recipientName,
          mentorName: dto.mentorName,
          candidateName: dto.candidateName,
          startTime: dto.sessionStartTime,
          endTime: dto.sessionEndTime,
          bookingId: dto.data.bookingId,
        });
      }
    } catch (err) {
      // Email failure is non-fatal — notification is already persisted + delivered via socket
      logger.error('[Notification] Email send failed (non-fatal):', err);
    }
  }
}
