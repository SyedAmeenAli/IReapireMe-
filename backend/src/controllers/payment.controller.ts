import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Product from '../models/Product';
import Order, { OrderStatus } from '../models/Order';
import borzoService from '../services/borzo.service';
import RepairTicket, { RepairStatus } from '../models/RepairTicket';
import mongoose from 'mongoose';

let razorpayInstance: Razorpay | null = null;

const getRazorpayInstance = (): Razorpay | null => {
  if (!razorpayInstance) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret || key_id.includes('YOUR_') || key_secret.includes('YOUR_')) {
      console.warn('⚠️ Razorpay credentials are not configured or are using placeholder values.');
      return null;
    }
    razorpayInstance = new Razorpay({ key_id, key_secret });
  }
  return razorpayInstance;
};

export const createPaymentOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, customerName, customerEmail, customerPhone, shippingAddress,
            serviceMode = 'walkin', expectedDeliveryFee, expiresAt, quoteToken, dropLat, dropLng,
            scheduledDate, scheduledSlot } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Cart items are required' });
      return;
    }

    if (!customerName || !customerPhone || !shippingAddress) {
      res.status(400).json({ message: 'Customer name, phone, and shipping address are required' });
      return;
    }

    let totalAmount = 0;
    const itemsWithFetchedPrice = [];

    // 1. Server-side price lookup to prevent client-side price tampering
    for (const item of items) {
      let productPrice = item.price || 0;
      let productId = item.id;
      
      if (mongoose.Types.ObjectId.isValid(item.id)) {
        const product = await Product.findById(item.id);
        if (product) {
          productPrice = product.price;
        }
      }

      const quantity = parseInt(item.quantity) || 1;
      totalAmount += productPrice * quantity;
      itemsWithFetchedPrice.push({
        productId: productId,
        quantity,
        price: productPrice
      });
    }

    // 2. Borzo Surge Validation (if Courier mode)
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
      const liveQuote = await borzoService.getQuote(storeLocation, customerLocation, shippingAddress);

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

      finalDeliveryFee = expectedDeliveryFee; // Absorb minor differences
      totalAmount += finalDeliveryFee;
    }

    // 3. Format amount in paise (Razorpay standard)
    const amountInPaise = Math.round(totalAmount * 100);

    const razorpay = getRazorpayInstance();
    let razorpayOrderId = 'MOCK_ORD_' + crypto.randomBytes(4).toString('hex').toUpperCase();

    if (razorpay) {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: 'receipt_' + crypto.randomBytes(4).toString('hex'),
      };
      const rzOrder = await razorpay.orders.create(options);
      razorpayOrderId = rzOrder.id;
    } else {
      console.warn('⚠️ Falling back to mock Razorpay Order ID.');
    }

    // 4. Create pending Order record in DB
    const order = new Order({
      customerName,
      customerEmail: customerEmail || '',
      customerPhone,
      shippingAddress,
      items: itemsWithFetchedPrice,
      totalAmount,
      status: OrderStatus.PENDING,
      serviceMode,
      scheduledDate,
      scheduledSlot,
      deliveryFee: finalDeliveryFee,
      razorpayOrderId,
    });

    await order.save();

    res.status(201).json({
      success: true,
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'MOCK_KEY_ID',
      isMock: !razorpay
    });
  } catch (error) {
    console.error('Create Payment Order Error:', error);
    res.status(500).json({ message: 'Server error during order creation', error: error instanceof Error ? error.message : String(error) });
  }
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ message: 'Missing verification fields' });
      return;
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret || key_secret.includes('YOUR_')) {
      console.warn('⚠️ Razorpay credentials missing. Simulating successful verification.');
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    let expectedSignature = '';
    
    // Check if we are running in MOCK mode (No Razorpay Secret)
    const isMockMode = !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET.includes('YOUR_');
    let isSignatureValid = false;

    if (isMockMode && razorpay_signature === 'mock_signature_bypass') {
      isSignatureValid = true;
    } else {
      expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
        .update(body.toString())
        .digest('hex');
      isSignatureValid = (expectedSignature === razorpay_signature);
    }

    if (isSignatureValid) {
      // 4. Idempotent & Atomic status update
      let order = await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id, status: OrderStatus.PENDING },
        { 
          status: OrderStatus.PROCESSING, // PAID equivalent
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature
        },
        { returnDocument: 'after' }
      );

      let isRepair = false;
      let repairTicket = null;

      if (!order) {
        // Try to find a RepairTicket
        repairTicket = await RepairTicket.findOneAndUpdate(
          { razorpayOrderId: razorpay_order_id, status: RepairStatus.PENDING },
          {
            status: RepairStatus.IN_PROGRESS, // PAID equivalent for Repair
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
          },
          { returnDocument: 'after' }
        );

        if (!repairTicket) {
          res.status(404).json({ success: false, message: 'Order/Ticket not found or already processed' });
          return;
        }
        isRepair = true;
      }

      const target = isRepair ? repairTicket! : order!;

      // 5. Trigger Borzo Dispatch
      if (target.serviceMode === 'courier' && !target.borzoOrderId) {
        try {
          const storeAddress = process.env.STORE_ADDRESS || 'iRepairMe Store, Hyderabad';
          const storePhone = process.env.STORE_PHONE || '9999999999';
          let scheduledTimeStr = undefined;
          if (target.scheduledDate && target.scheduledSlot) {
            scheduledTimeStr = `${target.scheduledDate} ${target.scheduledSlot}`;
          }

          // For Orders (Spare parts): Pickup from Store, Drop to Customer
          // For Repairs: Pickup from Customer, Drop to Store
          let pickupAddress = storeAddress;
          let dropoffAddress = (target as any).shippingAddress || (target as any).address;
          let pickupPhone = storePhone;
          let dropoffPhone = target.customerPhone;

          if (isRepair) {
            pickupAddress = (target as any).address || (target as any).shippingAddress;
            dropoffAddress = storeAddress;
            pickupPhone = target.customerPhone;
            dropoffPhone = storePhone;
          }

          // Create the Borzo Order
          const borzoId = await borzoService.createOrder(
            pickupAddress,
            pickupPhone,
            dropoffAddress,
            dropoffPhone,
            target.scheduledDate && target.scheduledSlot ? `${target.scheduledDate} ${target.scheduledSlot}` : undefined
          );

          // Save the Borzo ID
          target.borzoOrderId = borzoId;
          await target.save();
        } catch (err) {
          console.error('Borzo Dispatch Error:', err);
        }
      }

      res.status(200).json({ success: true, message: 'Payment verified successfully', data: target });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ message: 'Server error during signature verification' });
  }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      res.status(400).json({ message: 'Missing signature or webhook secret config' });
      return;
    }

    // 5. Raw body signature verification (prevents tampered webhooks)
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body) // req.body contains raw buffer
      .digest('hex');

    if (expectedSignature !== signature) {
      res.status(400).json({ message: 'Invalid webhook signature' });
      return;
    }

    const event = JSON.parse(req.body.toString());
    const payload = event.payload;

    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const orderDetails = payload.order ? payload.order.entity : null;
      const paymentDetails = payload.payment ? payload.payment.entity : null;
      
      const orderId = orderDetails?.id || paymentDetails?.order_id;
      const paymentId = paymentDetails?.id;

      if (orderId) {
        // Atomic status update to PROCESSING (paid)
        let updatedOrder = await Order.findOneAndUpdate(
          { razorpayOrderId: orderId, status: OrderStatus.PENDING },
          { 
            status: OrderStatus.PROCESSING,
            razorpayPaymentId: paymentId,
            razorpaySignature: signature
          },
          { new: true }
        );

        let isRepair = false;
        let updatedTicket = null;

        if (!updatedOrder) {
          updatedTicket = await RepairTicket.findOneAndUpdate(
            { razorpayOrderId: orderId, status: RepairStatus.PENDING },
            {
              status: RepairStatus.IN_PROGRESS,
              razorpayPaymentId: paymentId,
              razorpaySignature: signature
            },
            { new: true }
          );
          if (updatedTicket) isRepair = true;
        }

        const target = isRepair ? updatedTicket! : updatedOrder!;

        if (target && target.serviceMode === 'courier' && !target.borzoOrderId) {
          try {
            const storeAddress = process.env.STORE_ADDRESS || 'iRepairMe Store, Hyderabad';
            const storePhone = process.env.STORE_PHONE || '9999999999';

            let pickupAddress = storeAddress;
            let dropoffAddress = (target as any).shippingAddress || (target as any).address;
            let pickupPhone = storePhone;
            let dropoffPhone = target.customerPhone;

            if (isRepair) {
              pickupAddress = (target as any).address || (target as any).shippingAddress;
              dropoffAddress = storeAddress;
              pickupPhone = target.customerPhone;
              dropoffPhone = storePhone;
            }
            // Create the Borzo Order
            const borzoId = await borzoService.createOrder(
              pickupAddress,
              pickupPhone,
              dropoffAddress,
              dropoffPhone,
              target.scheduledDate && target.scheduledSlot ? `${target.scheduledDate} ${target.scheduledSlot}` : undefined
            );

            // Save the Borzo ID
            target.borzoOrderId = borzoId;
            await target.save();
          } catch (err) {
            console.error('Borzo Dispatch Webhook Error:', err);
          }
        }
      }
    } else if (event.event === 'payment.failed') {
      const paymentDetails = payload.payment ? payload.payment.entity : null;
      const orderId = paymentDetails?.order_id;

      if (orderId) {
        // Atomic status update to FAILED
        await Order.findOneAndUpdate(
          { razorpayOrderId: orderId, status: OrderStatus.PENDING },
          { status: OrderStatus.FAILED }
        );
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Handling Error:', error);
    res.status(500).json({ message: 'Server error during webhook event parsing' });
  }
};
