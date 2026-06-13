import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const createTicket: (req: Request, res: Response) => Promise<void>;
export declare const getTicketStatus: (req: Request, res: Response) => Promise<void>;
export declare const getMyTickets: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllTickets: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateTicketStatus: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=repair.controller.d.ts.map