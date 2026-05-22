import { Router } from 'express';
import { messageController } from '../../shared/di/chat.container';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/:roomId', authMiddleware, messageController.getRoomMessages);

export default router;
