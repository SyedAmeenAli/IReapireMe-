import mongoose, { Document, Schema } from 'mongoose';

export interface IServicePricing extends Document {
  deviceModel: string;
  service: string;
  price: number;
  estimatedTime: string;
  warrantyDays: number;
  inStock: boolean;
}

const ServicePricingSchema: Schema = new Schema(
  {
    deviceModel: { type: String, required: true },
    service: { type: String, required: true },
    price: { type: Number, required: true },
    estimatedTime: { type: String, default: '1 hour' },
    warrantyDays: { type: Number, default: 90 },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IServicePricing>('ServicePricing', ServicePricingSchema);
