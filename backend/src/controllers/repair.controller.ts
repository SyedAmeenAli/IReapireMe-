import { Request, Response } from 'express';
import RepairTicket, { RepairStatus } from '../models/RepairTicket';
import { AuthRequest } from '../middleware/auth.middleware';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production';

export const createTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, customerPhone, customerEmail, deviceType, brand, deviceModel, issueDescription, estimatedCost } = req.body;
    
    // Optional auth extraction
    let userId;
    const token = req.header('Authorization')?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.user.id;
      } catch (err) {
        // invalid token, proceed as guest
      }
    }

    const ticketId = 'TKT-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    const newTicket = new RepairTicket({
      ticketId,
      userId,
      customerName,
      customerPhone,
      customerEmail,
      deviceType,
      brand,
      deviceModel,
      issueDescription,
      status: RepairStatus.PENDING,
      estimatedCost,
    });

    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Create Ticket Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTicketStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;
    const ticket = await RepairTicket.findOne({ ticketId });
    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const tickets = await RepairTicket.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tickets = await RepairTicket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTicketStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, estimatedCost } = req.body;

    const ticket = await RepairTicket.findByIdAndUpdate(
      id,
      { status, estimatedCost },
      { new: true }
    );

    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
