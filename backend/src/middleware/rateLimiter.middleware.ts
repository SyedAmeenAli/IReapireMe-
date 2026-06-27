import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const priceUpdateRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userId = (req as any).user?.id || req.ip || 'unknown';
  const now = Date.now();
  const limitWindowMs = 60 * 1000; // 1 minute
  const maxRequests = 30;

  const record = rateLimitStore.get(userId);
  if (!record || now > record.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + limitWindowMs });
    return next();
  }

  record.count++;
  if (record.count > maxRequests) {
    logger.warn('Price update rate limit exceeded by user', { userId, count: record.count });
    res.status(429).json({
      message: 'Too many price updates. Rate limit exceeded (max 30 per minute).',
    });
    return;
  }

  next();
};

export default priceUpdateRateLimiter;
