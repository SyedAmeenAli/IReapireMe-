import express from 'express';
import { getDeliveryQuote, handleBorzoWebhook } from '../controllers/delivery.controller';

const router = express.Router();

router.post('/quote', getDeliveryQuote);
router.post('/borzo/webhook', handleBorzoWebhook);

export default router;
