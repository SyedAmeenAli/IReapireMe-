import mongoose, { Document } from 'mongoose';
export interface IServicePricing extends Document {
    deviceModel: string;
    service: string;
    price: number;
    estimatedTime: string;
    warrantyDays: number;
    inStock: boolean;
}
declare const _default: mongoose.Model<IServicePricing, {}, {}, {}, mongoose.Document<unknown, {}, IServicePricing, {}, mongoose.DefaultSchemaOptions> & IServicePricing & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IServicePricing>;
export default _default;
//# sourceMappingURL=ServicePricing.d.ts.map