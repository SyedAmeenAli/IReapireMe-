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
      if (this.id && this.id.startsWith('rec')) {
        const updated = await airtableOrderRepo.findByIdAndUpdate(this.id, cleanData);
        Object.assign(this, updated);
      } else {
        const created = await airtableOrderRepo.create(cleanData);
        Object.assign(this, created);
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
      Object.assign(this, mongoDoc.toObject());
    }
    return this;
  }
}

const OrderFacade = {
  find(query: any = {}): HybridQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      if (query._id) {
        return new HybridQuery(airtableOrderRepo.findById(query._id).then(r => r ? [r] : []));
      }
      return new HybridQuery(airtableOrderRepo.find(query));
    } else {
      return new HybridQuery(MongooseOrderModel.find(query).exec(), MongooseOrderModel.find(query));
    }
  },

  findOne(query: any = {}): HybridSingleQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      if (query._id) {
        return new HybridSingleQuery(airtableOrderRepo.findById(query._id));
      }
      return new HybridSingleQuery(airtableOrderRepo.findOne(query));
    } else {
      return new HybridSingleQuery(MongooseOrderModel.findOne(query).exec(), MongooseOrderModel.findOne(query));
    }
  },

  findById(id: string): HybridSingleQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      return new HybridSingleQuery(airtableOrderRepo.findById(id));
    } else {
      return new HybridSingleQuery(MongooseOrderModel.findById(id).exec(), MongooseOrderModel.findById(id));
    }
  },

  findByIdAndUpdate(id: string, update: any, options: any = {}): Promise<any | null> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      MongooseOrderModel.findByIdAndUpdate(id, update).exec().catch(() => {});
      return airtableOrderRepo.findByIdAndUpdate(id, update);
    } else {
      return MongooseOrderModel.findByIdAndUpdate(id, update, { new: true }).exec().then(doc => doc ? doc.toObject() : null);
    }
  },

  findOneAndUpdate(query: any, update: any, options: any = {}): Promise<any | null> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      MongooseOrderModel.findOneAndUpdate(query, update).exec().catch(() => {});
      return airtableOrderRepo.findOneAndUpdate(query, update);
    } else {
      return MongooseOrderModel.findOneAndUpdate(query, update, { new: true }).exec().then(doc => doc ? doc.toObject() : null);
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
