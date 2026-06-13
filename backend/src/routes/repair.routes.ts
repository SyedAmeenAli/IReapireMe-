import { Router } from 'express';
import { createTicket, getTicketStatus, getMyTickets, getAllTickets, updateTicketStatus } from '../controllers/repair.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public / Guest accessible
router.post('/book', createTicket);
router.get('/track/:ticketId', getTicketStatus);

// Protected (Customer)
router.get('/my-tickets', authMiddleware, getMyTickets);

// Protected (Admin)
router.get('/admin', authMiddleware, adminMiddleware, getAllTickets);
router.put('/admin/:id', authMiddleware, adminMiddleware, updateTicketStatus);

export default router;
