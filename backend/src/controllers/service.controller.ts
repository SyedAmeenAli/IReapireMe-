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
    const id = req.params.id as string;
    const adminUserId = (req as any).user?.id || 'unknown';
    const updatedService = await ServicePricing.findByIdAndUpdate(id, req.body, { adminUserId, new: true });
    
    if (!updatedService) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }
    
    res.json(updatedService);
  } catch (error) {
    console.error('Update Service Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const deletedService = await ServicePricing.findByIdAndDelete(id);
    
    if (!deletedService) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }
    
    res.json({ message: 'Service deleted successfully', deletedService });
  } catch (error) {
    console.error('Delete Service Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

import { flushCache } from '../services/serviceResolver';

export const flushServiceCache = async (req: Request, res: Response): Promise<void> => {
  try {
    const secret = req.query.secret || req.body.secret;
    const cacheSecret = process.env.AIRTABLE_CACHE_INVALIDATION_SECRET;
    
    if (!cacheSecret || secret !== cacheSecret) {
      res.status(401).json({ message: 'Unauthorized: Invalid invalidation secret token' });
      return;
    }

    flushCache();
    res.json({ success: true, message: 'Service catalog cache cleared successfully' });
  } catch (error) {
    console.error('Cache Flush Error:', error);
    res.status(500).json({ message: 'Server error during cache flush' });
  }
};
