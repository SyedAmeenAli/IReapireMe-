import { Router } from 'express';
import { register, login, getMe, sendOtp, verifyOtp } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', authMiddleware, getMe);

export default router;
