import { Router } from 'express';
import { notificationController } from '../../shared/di/notification.container';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * All notification routes require authentication.
 * The user ID is extracted from req.user.id — no role guard needed since
 * the service scopes all queries to the authenticated user's recipientId.
 */

// GET  /api/notifications              — paginated list
router.get('/', authMiddleware, notificationController.getNotifications);

// GET  /api/notifications/unread-count — unread badge count
// NOTE: Must be registered BEFORE /:id/read to avoid "unread-count" being treated as an ID
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);

// PATCH /api/notifications/read-all    — mark all as read
router.patch('/read-all', authMiddleware, notificationController.markAllAsRead);

// PATCH /api/notifications/:id/read    — mark single notification as read
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

export default router;
