import mongoose, { Document, Schema } from 'mongoose';

export enum RepairStatus {
  PENDING = 'PENDING',
  DIAGNOSING = 'DIAGNOSING',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_PARTS = 'WAITING_FOR_PARTS',
  COMPLETED = 'COMPLETED',
  DELIVERED = 'DELIVERED',
}

export interface IRepairTicket extends Document {
  ticketId: string;
  userId?: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deviceType: string;
  brand: string;
  deviceModel: string;
  issueDescription: string;
  status: RepairStatus;
  estimatedCost: number;
  createdAt: Date;
  updatedAt: Date;
}

const RepairTicketSchema: Schema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, required: true },
    deviceType: { type: String, required: true },
    brand: { type: String, required: true },
    deviceModel: { type: String, required: true },
    issueDescription: { type: String, required: true },
    status: { type: String, enum: Object.values(RepairStatus), default: RepairStatus.PENDING },
    estimatedCost: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IRepairTicket>('RepairTicket', RepairTicketSchema);
