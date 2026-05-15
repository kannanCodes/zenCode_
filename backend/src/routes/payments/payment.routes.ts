import { Router } from 'express';
import express from 'express';
import { webhookController, paymentController } from '../../shared/di/payment.container';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Checkout and Session verification
router.post('/checkout', authMiddleware, paymentController.createCheckout);
router.post('/verify-session', authMiddleware, paymentController.verifySession);

export default router;
