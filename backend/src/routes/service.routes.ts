import { Router } from 'express';
import { getAllServices, createService, updateService } from '../controllers/service.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getAllServices);
router.post('/', authMiddleware, adminMiddleware, createService);
router.put('/:id', authMiddleware, adminMiddleware, updateService);

export default router;
