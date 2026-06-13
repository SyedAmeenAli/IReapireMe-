import mongoose, { Document } from 'mongoose';
export declare enum OrderStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}
export interface IOrder extends Document {
    userId?: mongoose.Types.ObjectId;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    items: IOrderItem[];
    totalAmount: number;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, mongoose.DefaultSchemaOptions> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrder>;
export default _default;
//# sourceMappingURL=Order.d.ts.map