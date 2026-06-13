import mongoose, { Document } from 'mongoose';
export declare enum RepairStatus {
    PENDING = "PENDING",
    DIAGNOSING = "DIAGNOSING",
    IN_PROGRESS = "IN_PROGRESS",
    WAITING_FOR_PARTS = "WAITING_FOR_PARTS",
    COMPLETED = "COMPLETED",
    DELIVERED = "DELIVERED"
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
declare const _default: mongoose.Model<IRepairTicket, {}, {}, {}, mongoose.Document<unknown, {}, IRepairTicket, {}, mongoose.DefaultSchemaOptions> & IRepairTicket & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IRepairTicket>;
export default _default;
//# sourceMappingURL=RepairTicket.d.ts.map