import { NotificationRepository } from '../../repositories/notification/notification.repository';
import { NotificationService } from '../../services/notification/notification.service';
import { NotificationController } from '../../controllers/notification/notification.controller';
import { emailService } from './shared.container';

// ── Repository ────────────────────────────────────────────────────────────────
export const notificationRepository = new NotificationRepository();

// ── Service ───────────────────────────────────────────────────────────────────
export const notificationService = new NotificationService(
  notificationRepository,
  emailService
);

// ── Controller ────────────────────────────────────────────────────────────────
export const notificationController = new NotificationController(notificationService);
