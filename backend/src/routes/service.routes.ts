import { Router } from 'express';
import { getAllServices, createService, updateService, deleteService, flushServiceCache } from '../controllers/service.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';
import priceUpdateRateLimiter from '../middleware/rateLimiter.middleware';

const router = Router();

router.get('/', getAllServices);
router.post('/', authMiddleware, adminMiddleware, createService);
router.put('/:id', authMiddleware, adminMiddleware, priceUpdateRateLimiter, updateService);
router.delete('/:id', authMiddleware, adminMiddleware, deleteService);

// Secure Cache Invalidation Webhook
router.post('/cache-flush', flushServiceCache);

export default router;
