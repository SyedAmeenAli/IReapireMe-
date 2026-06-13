"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const repair_controller_1 = require("../controllers/repair.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public / Guest accessible
router.post('/book', repair_controller_1.createTicket);
router.get('/track/:ticketId', repair_controller_1.getTicketStatus);
// Protected (Customer)
router.get('/my-tickets', auth_middleware_1.authMiddleware, repair_controller_1.getMyTickets);
// Protected (Admin)
router.get('/admin', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, repair_controller_1.getAllTickets);
router.put('/admin/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, repair_controller_1.updateTicketStatus);
exports.default = router;
//# sourceMappingURL=repair.routes.js.map