import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getAllProducts: (req: Request, res: Response) => Promise<void>;
export declare const getProductById: (req: Request, res: Response) => Promise<void>;
export declare const createProduct: (req: Request, res: Response) => Promise<void>;
export declare const checkout: (req: Request, res: Response) => Promise<void>;
export declare const getMyOrders: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllOrders: (req: Request, res: Response) => Promise<void>;
export declare const updateOrderStatus: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=shop.controller.d.ts.map