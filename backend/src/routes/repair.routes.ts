import { Router } from 'express';
import {
  createTicket,
  getTicketStatus,
  getMyTickets,
  getAllTickets,
  updateTicketStatus,
  deleteTicket,
  createQueryLead,
  createLead
} from '../controllers/repair.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public / Guest accessible
router.post('/book', createTicket);
router.get('/track/:ticketId', getTicketStatus);
router.post('/query', createQueryLead);

// Protected (Customer)
router.get('/my-tickets', authMiddleware, getMyTickets);

// Protected (Admin)
router.get('/admin', authMiddleware, adminMiddleware, getAllTickets);
router.post('/admin/create-lead', authMiddleware, adminMiddleware, createLead);
router.put('/admin/:id', authMiddleware, adminMiddleware, updateTicketStatus);
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteTicket);

export default router;
