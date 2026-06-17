import { Request, Response } from 'express';
import RepairTicket, { RepairStatus } from '../models/RepairTicket';
import { AuthRequest } from '../middleware/auth.middleware';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import borzoService from '../services/borzo.service';

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
