"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shop_controller_1 = require("../controllers/shop.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Products
router.get('/products', shop_controller_1.getAllProducts);
router.get('/products/:id', shop_controller_1.getProductById);
router.post('/products', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, shop_controller_1.createProduct); // Admin only
// Orders
router.post('/checkout', shop_controller_1.checkout);
router.get('/orders/me', auth_middleware_1.authMiddleware, shop_controller_1.getMyOrders);
// Admin Orders
router.get('/admin/orders', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, shop_controller_1.getAllOrders);
router.put('/admin/orders/:id/status', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, shop_controller_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=shop.routes.js.map