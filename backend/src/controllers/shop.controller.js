"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getAllOrders = exports.getMyOrders = exports.checkout = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const express_1 = require("express");
const Product_1 = __importDefault(require("../models/Product"));
const Order_1 = __importStar(require("../models/Order"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production';
// Products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product_1.default.find();
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const product = new Product_1.default(req.body);
        await product.save();
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createProduct = createProduct;
// Orders
const checkout = async (req, res) => {
    try {
        const { customerName, customerEmail, customerPhone, shippingAddress, items, totalAmount } = req.body;
        // Optional auth extraction
        let userId;
        const token = req.header('Authorization')?.split(' ')[1];
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                userId = decoded.user.id;
            }
            catch (err) { }
        }
        // Creating order with local logic - no external payment gateways integration as requested
        const newOrder = new Order_1.default({
            userId,
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            items,
            totalAmount,
            status: Order_1.OrderStatus.PENDING, // Will remain pending until store processes it
        });
        await newOrder.save();
        // In a real app, we would decrement product stock here
        res.status(201).json({ message: 'Order placed successfully', orderId: newOrder._id });
    }
    catch (error) {
        console.error('Checkout Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.checkout = checkout;
const getMyOrders = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const orders = await Order_1.default.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMyOrders = getMyOrders;
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order_1.default.find().sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllOrders = getAllOrders;
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await Order_1.default.findByIdAndUpdate(id, { status }, { new: true });
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=shop.controller.js.map