"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateService = exports.createService = exports.getAllServices = void 0;
const express_1 = require("express");
const ServicePricing_1 = __importDefault(require("../models/ServicePricing"));
const getAllServices = async (req, res) => {
    try {
        const services = await ServicePricing_1.default.find();
        res.json(services);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllServices = getAllServices;
const createService = async (req, res) => {
    try {
        const newService = new ServicePricing_1.default(req.body);
        await newService.save();
        res.status(201).json(newService);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createService = createService;
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedService = await ServicePricing_1.default.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedService) {
            res.status(404).json({ message: 'Service not found' });
            return;
        }
        res.json(updatedService);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateService = updateService;
//# sourceMappingURL=service.controller.js.map