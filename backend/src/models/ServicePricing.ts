import mongoose, { Document, Schema } from 'mongoose';
import { getResolvedServices, updateCatalogPrice } from '../services/serviceResolver';
import { HybridQuery, HybridSingleQuery } from './airtable.repository';

export interface IServicePricing extends Document {
  deviceType?: string;
  brand?: string;
  deviceModel: string;
  service: string;
  price: number;
  estimatedTime: string;
  warrantyDays: number;
  inStock: boolean;
  syncSessionId?: string;
}

const ServicePricingSchema: Schema = new Schema(
  {
    deviceType: { type: String, required: false },
    brand: { type: String, required: false },
    deviceModel: { type: String, required: true },
    service: { type: String, required: true },
    price: { type: Number, required: true },
    estimatedTime: { type: String, default: '1 hour' },
    warrantyDays: { type: Number, default: 90 },
    inStock: { type: Boolean, default: true },
    syncSessionId: { type: String },
  },
  { timestamps: true }
);

const MongooseServicePricing = mongoose.models.ServicePricing || mongoose.model<IServicePricing>('ServicePricing', ServicePricingSchema);

// The Hybrid Facade Object mimicking Mongoose static operations
const ServicePricingFacade = {
  find(query: any = {}): HybridQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      const p = getResolvedServices().then(services => {
        // Filter resolved services in memory
        return services.filter((s: any) => {
          for (const key of Object.keys(query)) {
            // e.g. { deviceModel: 'iPhone 13' }
            if (s[key] !== query[key]) return false;
          }
          return true;
        });
      });
      return new HybridQuery(p);
    } else {
      return new HybridQuery(MongooseServicePricing.find(query).exec(), MongooseServicePricing.find(query));
    }
  },

  findOne(query: any = {}): HybridSingleQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      const p = getResolvedServices().then(services => {
        const found = services.find((s: any) => {
          for (const key of Object.keys(query)) {
            if (s[key] !== query[key]) return false;
          }
          return true;
        });
        return found || null;
      });
      return new HybridSingleQuery(p);
    } else {
      return new HybridSingleQuery(MongooseServicePricing.findOne(query).exec(), MongooseServicePricing.findOne(query));
    }
  },

  findById(id: string): HybridSingleQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      const p = getResolvedServices().then(services => {
        return services.find((s: any) => s.id === id) || null;
      });
      return new HybridSingleQuery(p);
    } else {
      return new HybridSingleQuery(MongooseServicePricing.findById(id).exec(), MongooseServicePricing.findById(id));
    }
  },

  // Update logic: Admin updates price by service ID (flat in-memory mapping)
  findByIdAndUpdate(id: string, update: any, options: any = {}): Promise<any | null> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      if (update.price !== undefined) {
        return updateCatalogPrice(id, Number(update.price), options.adminUserId).then(success => {
          if (!success) return null;
          // Return the updated item structure from in-memory cache
          return getResolvedServices().then(services => services.find((s: any) => s.id === id) || null);
        });
      }
      return Promise.resolve(null);
    } else {
      return MongooseServicePricing.findByIdAndUpdate(id, update, { new: true }).exec().then(doc => doc ? doc.toObject() : null);
    }
  },

  findByIdAndDelete(id: string): Promise<any | null> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      // Shared Airtable catalog entries cannot be deleted directly to avoid breaking shared layout/web design integrity
      return Promise.resolve({ id, message: 'Delete operation bypassed in Airtable to preserve schema' });
    } else {
      return MongooseServicePricing.findByIdAndDelete(id).exec().then(doc => doc ? doc.toObject() : null);
    }
  },

  insertMany(docs: any[]): Promise<any> {
    return MongooseServicePricing.insertMany(docs);
  },

  deleteMany(filter: any): Promise<any> {
    return MongooseServicePricing.deleteMany(filter);
  }
};

const ServicePricingConstructor = function(this: any, data: any) {
  // Direct instantiation only uses MongoDB (for seed fallback)
  return new MongooseServicePricing(data);
} as any as {
  new (data: any): any;
  find(query?: any): HybridQuery<any>;
  findOne(query?: any): HybridSingleQuery<any>;
  findById(id: string): HybridSingleQuery<any>;
  findByIdAndUpdate(id: string, update: any, options?: any): Promise<any | null>;
  findByIdAndDelete(id: string): Promise<any | null>;
  insertMany(docs: any[]): Promise<any>;
  deleteMany(filter: any): Promise<any>;
};

Object.assign(ServicePricingConstructor, ServicePricingFacade);

export default ServicePricingConstructor;
