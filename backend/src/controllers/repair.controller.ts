import { Request, Response } from 'express';
import RepairTicket, { RepairStatus } from '../models/RepairTicket';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import borzoService from '../services/borzo.service';
import { repairShoprService } from '../services/repairshopr.service';
import logger from '../utils/logger';

let razorpayInstance: Razorpay | null = null;

const getRazorpayInstance = (): Razorpay | null => {
  if (!razorpayInstance) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret || key_id.includes('YOUR_') || key_secret.includes('YOUR_')) {
      console.warn('⚠️ Razorpay credentials are not configured.');
      return null;
    }
    razorpayInstance = new Razorpay({ key_id, key_secret });
  }
  return razorpayInstance;
};

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production';

export const createTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerName, customerPhone, customerEmail,
      deviceType, brand, deviceModel, issueDescription, estimatedCost,
      serviceMode = 'walkin', expectedDeliveryFee, expiresAt, quoteToken,
      dropLat, dropLng, address, scheduledDate, scheduledSlot
    } = req.body;

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

    let finalDeliveryFee = 0;

    if (serviceMode === 'courier') {
      if (expectedDeliveryFee === undefined || !expiresAt || !quoteToken || !dropLat || !dropLng) {
        res.status(400).json({ message: 'Missing delivery quote validation fields' });
        return;
      }

      const isValidToken = borzoService.verifyQuoteToken(dropLat, dropLng, expectedDeliveryFee, expiresAt, quoteToken);
      if (!isValidToken) {
        res.status(400).json({ message: 'Invalid or expired delivery quote token' });
        return;
      }

      // Re-fetch live quote to check surge
      const storeLocation = borzoService.getStoreLocation();
      const customerLocation = { lat: dropLat, lng: dropLng };
      const liveQuote = await borzoService.getQuote(customerLocation, storeLocation, address); // customer to store

      const SURGE_TOLERANCE_PERCENT = 10;
      const diff = expectedDeliveryFee === 0 ? 0 : Math.abs(liveQuote.fee - expectedDeliveryFee) / expectedDeliveryFee * 100;

      if (diff > SURGE_TOLERANCE_PERCENT) {
        res.status(409).json({
          error: 'STALE_QUOTE',
          newFee: liveQuote.fee,
          message: 'Delivery fee has changed due to surge pricing.'
        });
        return;
      }

      finalDeliveryFee = expectedDeliveryFee;
    }

    const totalAmount = estimatedCost + finalDeliveryFee;
    const amountInPaise = Math.round(totalAmount * 100);

    const razorpay = getRazorpayInstance();
    let razorpayOrderId = 'MOCK_REP_' + crypto.randomBytes(4).toString('hex').toUpperCase();

    if (razorpay) {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: 'receipt_rep_' + crypto.randomBytes(4).toString('hex'),
      };
      const rzOrder = await razorpay.orders.create(options);
      razorpayOrderId = rzOrder.id;
    } else {
      console.warn('⚠️ Falling back to mock Razorpay Order ID for Repair.');
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
      serviceMode,
      address,
      scheduledDate,
      scheduledSlot,
      deliveryFee: finalDeliveryFee,
      razorpayOrderId
    });

    await newTicket.save();

    // Trigger RepairShopr sync in background
    syncTicketToRepairShopr(newTicket).catch(err => {
      logger.error(`[RepairShopr] Background sync trigger failed: ${err.message}`);
    });

    res.status(201).json({
      success: true,
      ticketId: newTicket.ticketId,
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'MOCK_KEY_ID',
      isMock: !razorpay
    });
  } catch (error) {
    console.error('Create Ticket Error:', error);
    res.status(500).json({ message: 'Server error during repair creation', error: error instanceof Error ? error.message : String(error) });
  }
};

export const getTicketStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;
    let ticket = await RepairTicket.findOne({ ticketId });
    if (!ticket) {
      ticket = await RepairTicket.findOne({ customerPhone: ticketId });
    }
    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }
    res.json(ticket);
  } catch (error) {
    console.error('Track Ticket Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const ticketsById = await RepairTicket.find({ userId: user.id });

    let ticketsByEmail: any[] = [];
    if (user.email && !user.email.endsWith('@irepairme.temp')) {
      ticketsByEmail = await RepairTicket.find({ customerEmail: user.email });
    }

    let ticketsByPhone: any[] = [];
    if (user.phone) {
      ticketsByPhone = await RepairTicket.find({ customerPhone: user.phone });
      const last10 = user.phone.replace(/\D/g, '').slice(-10);
      if (last10.length === 10 && last10 !== user.phone) {
        const extra = await RepairTicket.find({ customerPhone: last10 });
        ticketsByPhone = ticketsByPhone.concat(extra);
      }
    }

    const ticketsMap = new Map<string, any>();
    ticketsById.forEach(t => ticketsMap.set(t.ticketId, t));
    ticketsByEmail.forEach(t => ticketsMap.set(t.ticketId, t));
    ticketsByPhone.forEach(t => ticketsMap.set(t.ticketId, t));

    const mergedTickets = Array.from(ticketsMap.values());
    mergedTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(mergedTickets);
  } catch (error) {
    console.error('Get My Tickets Error:', error);
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
    const id = req.params.id as string;
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

    // Outbound status sync disabled per user instructions
    /*
    if (ticket.repairshoprTicketId) {
      repairShoprService.updateTicketStatus(ticket.repairshoprTicketId, status).catch(err => {
        logger.error(`[RepairShopr] Status update sync failed for ticket ${ticket.ticketId}: ${err.message}`);
      });
    }
    */

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const deleted = await RepairTicket.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }
    res.json({ message: 'Ticket deleted successfully', deleted });
  } catch (error) {
    console.error('Delete Ticket Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createQueryLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, customerPhone, preferredContactMethod, explainYourIssue } = req.body;

    if (!customerPhone || !preferredContactMethod || !explainYourIssue) {
      res.status(400).json({ message: 'Missing required fields: customerPhone, preferredContactMethod, and explainYourIssue' });
      return;
    }

    // Phone validation
    const phoneRegex = /^[6789]\d{9}$/;
    if (!phoneRegex.test(customerPhone)) {
      res.status(400).json({ message: 'Invalid phone number. Must be a valid 10-digit mobile number.' });
      return;
    }

    // Issue description length validation
    if (explainYourIssue.length > 500) {
      res.status(400).json({ message: 'Issue description cannot exceed 500 characters.' });
      return;
    }

    // Duplicate check within last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await RepairTicket.findOne({
      customerPhone,
      status: RepairStatus.PENDING,
      createdAt: { $gte: oneDayAgo }
    });

    if (existing) {
      res.status(409).json({ message: 'You already have a pending query. We will contact you soon.' });
      return;
    }

    const ticketId = 'TKT-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    const newTicket = new RepairTicket({
      ticketId,
      customerName: customerName || 'Query Customer',
      customerPhone,
      customerEmail: 'no-email@provided.com',
      deviceType: 'Unknown',
      brand: 'Unknown',
      deviceModel: 'Unknown',
      issueDescription: `[Preferred Contact: ${preferredContactMethod}] ${explainYourIssue}`,
      status: RepairStatus.PENDING,
      estimatedCost: 0,
      serviceMode: 'walkin',
      source: 'query_widget',
      deliveryFee: 0
    });

    await newTicket.save();

    // Sync to RepairShopr in background
    syncTicketToRepairShopr(newTicket).catch(err => {
      logger.error(`[RepairShopr] Background sync trigger failed: ${err.message}`);
    });

    res.status(201).json({
      success: true,
      message: "Thanks! We'll contact you shortly.",
      ticketId: newTicket.ticketId
    });
  } catch (error) {
    logger.error(`Create Query Lead Error: ${error}`);
    res.status(500).json({ message: 'Server error during query lead creation' });
  }
};

export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      customerName, customerPhone, customerEmail,
      deviceType, brand, deviceModel, issueDescription,
      estimatedCost = 0, serviceMode = 'walkin', address,
      scheduledDate, scheduledSlot, force = false
    } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !customerEmail || !deviceType || !brand || !deviceModel || !issueDescription) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Phone validation
    const phoneRegex = /^[6789]\d{9}$/;
    const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
    if (!phoneRegex.test(cleanPhone)) {
      res.status(400).json({ message: 'Invalid phone number. Must be a valid 10-digit mobile number.' });
      return;
    }

    // Issue description length validation
    if (issueDescription.length > 500) {
      res.status(400).json({ message: 'Issue description cannot exceed 500 characters.' });
      return;
    }

    // Soft duplicate guard
    const existing = await RepairTicket.findOne({
      customerPhone: cleanPhone,
      deviceModel,
      status: RepairStatus.PENDING
    });

    if (existing && !force) {
      res.status(409).json({
        message: 'A pending lead already exists for this customer and device.',
        existingTicketId: existing.ticketId
      });
      return;
    }

    const ticketId = 'TKT-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    const newTicket = new RepairTicket({
      ticketId,
      userId: req.user?.id,
      customerName,
      customerPhone: cleanPhone,
      customerEmail,
      deviceType,
      brand,
      deviceModel,
      issueDescription,
      status: RepairStatus.PENDING,
      estimatedCost,
      serviceMode,
      address,
      scheduledDate,
      scheduledSlot,
      source: 'admin_manual',
      forceCreated: !!(existing && force),
      createdBy: req.user?.id
    });

    await newTicket.save();

    // Trigger RepairShopr sync in background
    syncTicketToRepairShopr(newTicket).catch(err => {
      logger.error(`[RepairShopr] Background sync trigger failed: ${err.message}`);
    });

    res.status(201).json(newTicket);
  } catch (error) {
    logger.error(`Create Admin Lead Error: ${error}`);
    res.status(500).json({ message: 'Server error during manual lead creation' });
  }
};

async function syncTicketToRepairShopr(ticket: any): Promise<void> {
  // Only sync query widget leads to RepairShopr. Standard website bookings and manual admin leads do not sync.
  if (ticket.source !== 'query_widget') {
    return;
  }

  try {
    const rsCustomer = await repairShoprService.searchOrCreateCustomer({
      firstname: ticket.customerName.split(' ')[0] || 'Unknown',
      lastname: ticket.customerName.split(' ').slice(1).join(' ') || 'Customer',
      email: ticket.customerEmail,
      phone: ticket.customerPhone
    });

    const subject = `Query - ${ticket.ticketId}`;
    const problemType = 'Unknown';

    const rsTicket = await repairShoprService.createTicket({
      customerId: rsCustomer.id,
      subject: subject,
      issueDescription: ticket.issueDescription,
      status: 'New',
      problem_type: problemType
    });

    ticket.repairshoprCustomerId = String(rsCustomer.id);
    ticket.repairshoprTicketId = String(rsTicket.id);
    await ticket.save();
    logger.info(`[RepairShopr] Synced query lead ${ticket.ticketId} successfully. RS Customer ID: ${rsCustomer.id}, RS Ticket ID: ${rsTicket.id}`);
  } catch (err: any) {
    logger.error(`[RepairShopr] Sync failed for query lead ${ticket.ticketId}: ${err.message}`, { error: err });
  }
}
