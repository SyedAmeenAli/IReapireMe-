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
exports.updateTicketStatus = exports.getAllTickets = exports.getMyTickets = exports.getTicketStatus = exports.createTicket = void 0;
const express_1 = require("express");
const RepairTicket_1 = __importStar(require("../models/RepairTicket"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production';
const createTicket = async (req, res) => {
    try {
        const { customerName, customerPhone, customerEmail, deviceType, brand, deviceModel, issueDescription, estimatedCost } = req.body;
        // Optional auth extraction
        let userId;
        const token = req.header('Authorization')?.split(' ')[1];
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                userId = decoded.user.id;
            }
            catch (err) {
                // invalid token, proceed as guest
            }
        }
        const ticketId = 'TKT-' + crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
        const newTicket = new RepairTicket_1.default({
            ticketId,
            userId,
            customerName,
            customerPhone,
            customerEmail,
            deviceType,
            brand,
            deviceModel,
            issueDescription,
            status: RepairTicket_1.RepairStatus.PENDING,
            estimatedCost,
        });
        await newTicket.save();
        res.status(201).json(newTicket);
    }
    catch (error) {
        console.error('Create Ticket Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createTicket = createTicket;
const getTicketStatus = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const ticket = await RepairTicket_1.default.findOne({ ticketId });
        if (!ticket) {
            res.status(404).json({ message: 'Ticket not found' });
            return;
        }
        res.json(ticket);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getTicketStatus = getTicketStatus;
const getMyTickets = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const tickets = await RepairTicket_1.default.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(tickets);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMyTickets = getMyTickets;
const getAllTickets = async (req, res) => {
    try {
        const tickets = await RepairTicket_1.default.find().sort({ createdAt: -1 });
        res.json(tickets);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllTickets = getAllTickets;
const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, estimatedCost } = req.body;
        const ticket = await RepairTicket_1.default.findByIdAndUpdate(id, { status, estimatedCost }, { new: true });
        if (!ticket) {
            res.status(404).json({ message: 'Ticket not found' });
            return;
        }
        res.json(ticket);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateTicketStatus = updateTicketStatus;
//# sourceMappingURL=repair.controller.js.map