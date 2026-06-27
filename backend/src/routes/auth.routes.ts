import { Router } from 'express';
import { register, login, getMe, sendOtp, verifyOtp, getCart, updateCart, getUsers } from '../controllers/auth.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', authMiddleware, getMe);

// Cart management
router.get('/cart', authMiddleware, getCart);
router.post('/cart', authMiddleware, updateCart);

// Admin routes
router.get('/admin/users', authMiddleware, adminMiddleware, getUsers);

export default router;
