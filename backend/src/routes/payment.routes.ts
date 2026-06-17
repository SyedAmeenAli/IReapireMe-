import express, { Router } from 'express';
import { createPaymentOrder, verifyPayment, handleWebhook } from '../controllers/payment.controller';

const router = Router();

router.post('/order', express.json(), createPaymentOrder);
router.post('/verify', express.json(), verifyPayment);

// Webhook endpoint requires raw request body for Razorpay signature check.
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
