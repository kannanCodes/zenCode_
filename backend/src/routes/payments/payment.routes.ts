import { Router } from 'express';
import express from 'express';
import { webhookController, paymentController } from '../../shared/di/payment.container';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Stripe requires the raw body to construct the event
router.post('/webhook', express.raw({ type: 'application/json' }), webhookController.stripeWebhookHandler);

// Checkout and Session verification
router.post('/checkout', authMiddleware, paymentController.createCheckout);
router.post('/verify-session', authMiddleware, paymentController.verifySession);

export default router;
