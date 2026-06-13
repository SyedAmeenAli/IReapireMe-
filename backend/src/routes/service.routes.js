"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_controller_1 = require("../controllers/service.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', service_controller_1.getAllServices);
router.post('/', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, service_controller_1.createService);
router.put('/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, service_controller_1.updateService);
exports.default = router;
//# sourceMappingURL=service.routes.js.map