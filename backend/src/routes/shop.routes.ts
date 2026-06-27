import { Router } from 'express';
import {
  getAllProducts, getProductById, createProduct,
  checkout, getMyOrders, getAllOrders, updateOrderStatus
} from '../controllers/shop.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Products
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.post('/products', authMiddleware, adminMiddleware, createProduct); // Admin only

// Orders
router.post('/checkout', checkout);
router.get('/orders/me', authMiddleware, getMyOrders);

// Admin Orders
router.get('/admin/orders', authMiddleware, adminMiddleware, getAllOrders);
router.put('/admin/orders/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);

export default router;
