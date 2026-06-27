import mongoose, { Document, Schema } from 'mongoose';
import { AirtableRepository, HybridQuery, HybridSingleQuery } from './airtable.repository';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export interface IOrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  serviceMode: 'walkin' | 'courier';
  scheduledDate?: string;
  scheduledSlot?: string;
  deliveryFee: number;
  borzoOrderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const OrderSchema: Schema = new Schema(
  {
    userId: { type: String }, // Store as string reference for hybrid simplicity
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    serviceMode: { type: String, enum: ['walkin', 'courier'], default: 'walkin' },
    scheduledDate: { type: String },
    scheduledSlot: { type: String },
    deliveryFee: { type: Number, default: 0 },
    borzoOrderId: { type: String },
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

const MongooseOrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

const tableName = process.env.AIRTABLE_TABLE_ORDERS || 'orders';
const airtableOrderRepo = new AirtableRepository<IOrder>(tableName);

export function toAirtableOrder(data: any): any {
  if (!data) return null;
  const result: any = {};
  
  if (data.userId !== undefined) result.userId = data.userId;
  if (data.customerName !== undefined) result.customerName = data.customerName;
  if (data.customerEmail !== undefined) result.customerEmail = data.customerEmail;
  if (data.customerPhone !== undefined) {
    result.customerPhone = data.customerPhone ? Number(String(data.customerPhone).replace(/\D/g, '')) : null;
  }
  if (data.shippingAddress !== undefined) result.address = data.shippingAddress;
  if (data.status !== undefined) result.status = data.status;
  if (data.razorpayOrderId !== undefined) result.orderId = data.razorpayOrderId;
  if (data.totalAmount !== undefined) result.totalAmount = data.totalAmount;
  
  if (data.items !== undefined && Array.isArray(data.items)) {
    result.items = data.items.map((item: any) => ({
      productId: item.productId,
      qty: item.quantity ?? item.qty ?? 1
    }));
  }
  
  return result;
}

export function fromAirtableOrder(raw: any): any {
  if (!raw) return null;
  
  const customerName = raw.customerName || '';
  const customerEmail = raw.customerEmail || '';
  const customerPhone = raw.customerPhone ? String(raw.customerPhone) : '';
  const shippingAddress = raw.address || raw.shippingAddress || '';
  const status = raw.status || 'PENDING';
  const razorpayOrderId = raw.orderId || raw.razorpayOrderId || '';
  const totalAmount = typeof raw.totalAmount === 'number' ? raw.totalAmount : 0;
  
  let items: any[] = [];
  if (raw.items) {
    let parsedItems = raw.items;
    if (typeof parsedItems === 'string') {
      try {
        parsedItems = JSON.parse(parsedItems);
      } catch (e) {
        parsedItems = [];
      }
    }
    if (Array.isArray(parsedItems)) {
      items = parsedItems.map((item: any) => ({
        productId: item.productId || item.id,
        quantity: item.qty ?? item.quantity ?? 1,
        price: item.price ?? 0
      }));
    }
  }
  
  return {
    id: raw.id || raw._id,
    _id: raw.id || raw._id,
    userId: raw.userId,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items,
    totalAmount,
    status,
    serviceMode: raw.serviceMode || 'walkin',
    scheduledDate: raw.scheduledDate,
    scheduledSlot: raw.scheduledSlot,
    deliveryFee: typeof raw.deliveryFee === 'number' ? raw.deliveryFee : 0,
    borzoOrderId: raw.borzoOrderId,
    razorpayOrderId,
    razorpayPaymentId: raw.razorpayPaymentId,
    razorpaySignature: raw.razorpaySignature,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

class HybridOrder {
  id?: string;
  _id?: string;
  userId?: string;
  customerName!: string;
  customerEmail!: string;
  customerPhone!: string;
  shippingAddress!: string;
  items!: IOrderItem[];
  totalAmount!: number;
  status!: OrderStatus;
  serviceMode!: 'walkin' | 'courier';
  scheduledDate?: string;
  scheduledSlot?: string;
  deliveryFee!: number;
  borzoOrderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: any) {
    Object.assign(this, data);
  }

  async save(): Promise<this> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    const cleanData = { ...this };
    delete (cleanData as any).save;

    if (useAirtable) {
      const airtablePayload = toAirtableOrder(cleanData);
      if (this.id && this.id.startsWith('rec')) {
        const updated = await airtableOrderRepo.findByIdAndUpdate(this.id, airtablePayload);
        Object.assign(this, fromAirtableOrder(updated));
      } else {
        const created = await airtableOrderRepo.create(airtablePayload);
        Object.assign(this, fromAirtableOrder(created));
      }

      // Background dual-write
      MongooseOrderModel.findOne({ razorpayOrderId: this.razorpayOrderId }).exec().then(existing => {
        const payload = {
          userId: this.userId,
          customerName: this.customerName,
          customerEmail: this.customerEmail,
          customerPhone: this.customerPhone,
          shippingAddress: this.shippingAddress,
          items: this.items,
          totalAmount: this.totalAmount,
          status: this.status,
          serviceMode: this.serviceMode,
          scheduledDate: this.scheduledDate,
          scheduledSlot: this.scheduledSlot,
          deliveryFee: this.deliveryFee,
          borzoOrderId: this.borzoOrderId,
          razorpayOrderId: this.razorpayOrderId,
          razorpayPaymentId: this.razorpayPaymentId,
          razorpaySignature: this.razorpaySignature
        };
        if (existing) {
          MongooseOrderModel.findByIdAndUpdate(existing.id, payload).exec().catch(() => {});
        } else {
          new MongooseOrderModel(payload).save().catch(() => {});
        }
      }).catch(() => {});
    } else {
      let mongoDoc;
      if (this._id && !String(this._id).startsWith('rec')) {
        mongoDoc = await MongooseOrderModel.findByIdAndUpdate(this._id, cleanData, { new: true });
      } else {
        const newDoc = new MongooseOrderModel(cleanData);
        mongoDoc = await newDoc.save();
      }
      Object.assign(this, fromAirtableOrder(mongoDoc.toObject()));
    }
    return this;
  }
}

const OrderFacade = {
  find(query: any = {}): HybridQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable && !query.userId) {
      if (query._id) {
        return new HybridQuery(airtableOrderRepo.findById(query._id).then(r => r ? [fromAirtableOrder(r)] : []));
      }
      const airtableQuery = { ...query };
      if (query.razorpayOrderId) {
        airtableQuery.orderId = query.razorpayOrderId;
        delete airtableQuery.razorpayOrderId;
      }
      return new HybridQuery(airtableOrderRepo.find(airtableQuery).then(records => records.map(fromAirtableOrder)));
    } else {
      const promise = MongooseOrderModel.find(query).exec().then(records => records.map(r => fromAirtableOrder(r.toObject())));
      return new HybridQuery(promise, MongooseOrderModel.find(query), fromAirtableOrder);
    }
  },

  findOne(query: any = {}): HybridSingleQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable && !query.userId) {
      if (query._id) {
        return new HybridSingleQuery(airtableOrderRepo.findById(query._id).then(fromAirtableOrder));
      }
      const airtableQuery = { ...query };
      if (query.razorpayOrderId) {
        airtableQuery.orderId = query.razorpayOrderId;
        delete airtableQuery.razorpayOrderId;
      }
      return new HybridSingleQuery(airtableOrderRepo.findOne(airtableQuery).then(fromAirtableOrder));
    } else {
      const promise = MongooseOrderModel.findOne(query).exec().then(doc => doc ? fromAirtableOrder(doc.toObject()) : null);
      return new HybridSingleQuery(promise, MongooseOrderModel.findOne(query), fromAirtableOrder);
    }
  },

  findById(id: string): HybridSingleQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      return new HybridSingleQuery(airtableOrderRepo.findById(id).then(fromAirtableOrder));
    } else {
      const promise = MongooseOrderModel.findById(id).exec().then(doc => doc ? fromAirtableOrder(doc.toObject()) : null);
      return new HybridSingleQuery(promise, MongooseOrderModel.findById(id), fromAirtableOrder);
    }
  },

  findByIdAndUpdate(id: string, update: any, options: any = {}): Promise<any | null> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      const airtableUpdate = toAirtableOrder(update);
      MongooseOrderModel.findByIdAndUpdate(id, update).exec().catch(() => {});
      return airtableOrderRepo.findByIdAndUpdate(id, airtableUpdate).then(fromAirtableOrder);
    } else {
      return MongooseOrderModel.findByIdAndUpdate(id, update, { new: true }).exec().then(doc => doc ? fromAirtableOrder(doc.toObject()) : null);
    }
  },

  findOneAndUpdate(query: any, update: any, options: any = {}): Promise<any | null> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    const airtableQuery = { ...query };
    if (query.razorpayOrderId) {
      airtableQuery.orderId = query.razorpayOrderId;
      delete airtableQuery.razorpayOrderId;
    }
    if (useAirtable) {
      const airtableUpdate = toAirtableOrder(update);
      MongooseOrderModel.findOneAndUpdate(query, update).exec().catch(() => {});
      return airtableOrderRepo.findOneAndUpdate(airtableQuery, airtableUpdate).then(fromAirtableOrder);
    } else {
      return MongooseOrderModel.findOneAndUpdate(query, update, { new: true }).exec().then(doc => doc ? fromAirtableOrder(doc.toObject()) : null);
    }
  }
};

const OrderConstructor = function(this: any, data: any) {
  return new HybridOrder(data);
} as any as {
  new (data: any): HybridOrder;
  find(query?: any): HybridQuery<any>;
  findOne(query?: any): HybridSingleQuery<any>;
  findById(id: string): HybridSingleQuery<any>;
  findByIdAndUpdate(id: string, update: any, options?: any): Promise<any | null>;
  findOneAndUpdate(query: any, update: any, options?: any): Promise<any | null>;
};

Object.assign(OrderConstructor, OrderFacade);

export default OrderConstructor;
