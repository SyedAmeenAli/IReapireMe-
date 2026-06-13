import { Request, Response } from 'express';
import ServicePricing from '../models/ServicePricing';

export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await ServicePricing.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const newService = new ServicePricing(req.body);
    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedService = await ServicePricing.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedService) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }
    
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
