import axios, { AxiosInstance } from 'axios';
import logger from '../utils/logger';

export interface RepairShoprCustomerInput {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
}

export interface RepairShoprCustomer {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
}

export interface RepairShoprTicketInput {
  customerId: number;
  subject: string;
  issueDescription: string;
  status: string; // must be mapped RS status
  problem_type?: string;
}

export interface RepairShoprTicket {
  id: number;
  number: string;
  subject: string;
  created_at: string;
  updated_at: string;
  status: string;
  problem_type?: string;
  customer_id: number;
  customer?: {
    id: number;
    firstname: string;
    lastname: string;
    fullname: string;
    email: string;
    phone: string;
  };
}

export const STATUS_MAP: Record<string, string> = {
  PENDING: 'New',
  IN_PROGRESS: 'In Progress',
  WAITING_FOR_PARTS: 'Waiting for Parts',
  COMPLETED: 'Resolved',
  DELIVERED: 'Customer states issue resolved',
};

export const REVERSE_STATUS_MAP: Record<string, string> = {
  'New': 'PENDING',
  'In Progress': 'IN_PROGRESS',
  'Waiting for Parts': 'WAITING_FOR_PARTS',
  'Resolved': 'COMPLETED',
  'Customer states issue resolved': 'DELIVERED',
};

export class RepairShoprService {
  private axiosInstance: AxiosInstance | null = null;
  private isMockMode: boolean = false;

  constructor() {
    const subdomain = process.env.REPAIRSHOPR_SUBDOMAIN;
    const apiKey = process.env.REPAIRSHOPR_API_KEY;

    if (!subdomain || !apiKey || subdomain.includes('YOUR_') || apiKey.includes('YOUR_')) {
      logger.warn('[RepairShopr] Missing or placeholder credentials in .env. Operating in MOCK mode.');
      this.isMockMode = true;
    } else {
      const cleanedSubdomain = subdomain.trim();
      const cleanedApiKey = apiKey.trim();
      this.axiosInstance = axios.create({
        baseURL: `https://${cleanedSubdomain}.repairshopr.com/api/v1`,
        headers: {
          Authorization: `Bearer ${cleanedApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 8000,
      });
      logger.info(`[RepairShopr] API Client initialized for subdomain: ${cleanedSubdomain}`);
    }
  }

  private async executeWithRetry<T>(requestFn: () => Promise<T>): Promise<T> {
    let delay = 1000;
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error: any) {
        const status = error?.response?.status;
        const isRetryable = [429, 502, 503, 504].includes(status);
        if (isRetryable && attempt < maxRetries) {
          logger.warn(`[RepairShopr] API error ${status} on attempt ${attempt}. Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          throw error;
        }
      }
    }
    throw new Error('Max retries exceeded');
  }

  async searchCustomer(email?: string, phone?: string): Promise<RepairShoprCustomer | null> {
    if (this.isMockMode) {
      return {
        id: 123,
        firstname: 'Mock',
        lastname: 'Customer',
        email: email || 'mock@example.com',
        phone: phone || '9876543210',
      };
    }

    if (email) {
      const customers = await this.executeWithRetry(async () => {
        const res = await this.axiosInstance!.get('/customers', { params: { email } });
        return res.data.customers || [];
      });
      if (customers.length > 0) return customers[0];
    }

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const customers = await this.executeWithRetry(async () => {
        const res = await this.axiosInstance!.get('/customers', { params: { phone: cleanPhone } });
        return res.data.customers || [];
      });
      if (customers.length > 0) return customers[0];
    }

    return null;
  }

  async createCustomer(data: RepairShoprCustomerInput): Promise<RepairShoprCustomer> {
    if (this.isMockMode) {
      return {
        id: Math.floor(Math.random() * 1000) + 100,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone,
      };
    }

    const res = await this.executeWithRetry(async () => {
      return await this.axiosInstance!.post('/customers', data);
    });
    return res.data.customer || res.data;
  }

  async searchOrCreateCustomer(data: RepairShoprCustomerInput): Promise<RepairShoprCustomer> {
    const existing = await this.searchCustomer(data.email, data.phone);
    if (existing) return existing;
    return await this.createCustomer(data);
  }

  async createTicket(data: RepairShoprTicketInput): Promise<RepairShoprTicket> {
    if (this.isMockMode) {
      return {
        id: Math.floor(Math.random() * 1000) + 100,
        number: 'MOCK-RS-TKT-' + Math.floor(Math.random() * 9000 + 1000),
        subject: data.subject,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: data.status,
        problem_type: data.problem_type,
        customer_id: data.customerId,
      };
    }

    const payload = {
      customer_id: data.customerId,
      subject: data.subject,
      description: data.issueDescription,
      status: data.status,
      problem_type: data.problem_type,
    };

    const res = await this.executeWithRetry(async () => {
      return await this.axiosInstance!.post('/tickets', payload);
    });
    return res.data.ticket || res.data;
  }

  async updateTicketStatus(repairshoprTicketId: string, status: string): Promise<void> {
    if (this.isMockMode) {
      logger.info(`Mock mode: Updated RepairShopr ticket status for ID: ${repairshoprTicketId} to ${status}`);
      return;
    }
    const idNum = parseInt(repairshoprTicketId, 10);
    if (isNaN(idNum)) {
      logger.error(`Invalid RepairShopr ticket ID for status update: ${repairshoprTicketId}`);
      return;
    }
    const rsStatus = STATUS_MAP[status] || status;
    await this.executeWithRetry(async () => {
      await this.axiosInstance!.put(`/tickets/${idNum}`, { status: rsStatus });
    });
  }

  async fetchTicketsSince(date: Date): Promise<RepairShoprTicket[]> {
    if (this.isMockMode) {
      return [];
    }

    const results: RepairShoprTicket[] = [];
    let page = 1;
    let keepFetching = true;
    const sinceTime = date.getTime();

    while (keepFetching) {
      const tickets = await this.executeWithRetry(async () => {
        const res = await this.axiosInstance!.get('/tickets', { params: { page } });
        return res.data.tickets || [];
      });

      if (tickets.length === 0) {
        break;
      }

      let pageHasMatches = false;
      for (const t of tickets) {
        const updatedTime = new Date(t.updated_at).getTime();
        if (updatedTime >= sinceTime) {
          results.push(t);
          pageHasMatches = true;
        }
      }

      if (!pageHasMatches) {
        keepFetching = false;
      } else {
        page++;
      }
    }

    return results;
  }

  async fetchAllTickets(): Promise<RepairShoprTicket[]> {
    if (this.isMockMode) {
      return [
        {
          id: 9901,
          number: 'MOCK-RS-TKT-9901',
          subject: 'Broken Screen iPhone 12',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'New',
          problem_type: 'iPhone',
          customer_id: 101,
          customer: {
            id: 101,
            firstname: 'John',
            lastname: 'Doe',
            fullname: 'John Doe',
            email: 'john@example.com',
            phone: '9876543210',
          },
        },
        {
          id: 9902,
          number: 'MOCK-RS-TKT-9902',
          subject: 'Battery replacement laptop',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'In Progress',
          problem_type: 'Laptop',
          customer_id: 102,
          customer: {
            id: 102,
            firstname: 'Alice',
            lastname: 'Smith',
            fullname: 'Alice Smith',
            email: 'alice@example.com',
            phone: '8765432109',
          },
        },
      ];
    }

    const results: RepairShoprTicket[] = [];
    let page = 1;
    while (true) {
      const tickets = await this.executeWithRetry(async () => {
        const res = await this.axiosInstance!.get('/tickets', { params: { page } });
        return res.data.tickets || [];
      });
      if (tickets.length === 0) {
        break;
      }
      results.push(...tickets);
      page++;
    }
    return results;
  }
}

export const repairShoprService = new RepairShoprService();
