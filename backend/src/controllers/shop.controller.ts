import { Request, Response } from 'express';
import Product from '../models/Product';
import Order, { OrderStatus } from '../models/Order';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production';

// Products
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id as string);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Orders
export const checkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress, items, totalAmount } = req.body;

    // Optional auth extraction
    let userId;
    const token = req.header('Authorization')?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.user.id;
      } catch (err) { }
    }

    // Creating order with local logic - no external payment gateways integration as requested
    const newOrder = new Order({
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      totalAmount,
      status: OrderStatus.PENDING, // Will remain pending until store processes it
    });

    await newOrder.save();

    // In a real app, we would decrement product stock here

    res.status(201).json({ message: 'Order placed successfully', orderId: newOrder._id });
  } catch (error) {
    console.error('Checkout Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Look up user details for comprehensive search (same pattern as getMyTickets)
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    console.log('[getMyOrders] Looking up orders for user:', { id: user.id, email: user.email, phone: user.phone });

    // Search by userId (falls to MongoDB when Airtable is enabled)
    const ordersById = await Order.find({ userId: user.id });
    console.log('[getMyOrders] Orders by userId:', ordersById.length);

    // Search by customerEmail (goes to Airtable)
    let ordersByEmail: any[] = [];
    if (user.email && !user.email.endsWith('@irepairme.temp')) {
      ordersByEmail = await Order.find({ customerEmail: user.email });
      console.log('[getMyOrders] Orders by email:', ordersByEmail.length);
    }

    // Search by customerPhone (goes to Airtable)
    // Airtable stores phone as a number (e.g. 7386446601), so we must query with a number
    let ordersByPhone: any[] = [];
    if (user.phone) {
      const phoneDigits = user.phone.replace(/\D/g, '').slice(-10);
      if (phoneDigits.length === 10) {
        // Query as number since toAirtableOrder converts phone to Number
        const phoneAsNumber = Number(phoneDigits);
        ordersByPhone = await Order.find({ customerPhone: phoneAsNumber });
        console.log('[getMyOrders] Orders by phone (number):', ordersByPhone.length);

        // Also try string format for MongoDB records
        if (ordersByPhone.length === 0) {
          const phoneStr = await Order.find({ customerPhone: phoneDigits });
          const phoneStrFull = await Order.find({ customerPhone: user.phone });
          ordersByPhone = [...phoneStr, ...phoneStrFull];
          console.log('[getMyOrders] Orders by phone (string fallback):', ordersByPhone.length);
        }
      }
    }

    // Deduplicate by order ID
    const ordersMap = new Map<string, any>();
    ordersById.forEach((o: any) => ordersMap.set(o.id || o._id, o));
    ordersByEmail.forEach((o: any) => ordersMap.set(o.id || o._id, o));
    ordersByPhone.forEach((o: any) => ordersMap.set(o.id || o._id, o));

    const mergedOrders = Array.from(ordersMap.values());
    mergedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log('[getMyOrders] Total unique orders found:', mergedOrders.length);
    res.json(mergedOrders);
  } catch (error) {
    console.error('Get My Orders Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
