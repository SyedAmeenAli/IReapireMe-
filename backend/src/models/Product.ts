import mongoose, { Document, Schema } from 'mongoose';
import { AirtableRepository, HybridQuery, HybridSingleQuery } from './airtable.repository';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl: string;
  isFeatured: boolean;
  createdAt: Date;
  syncSessionId?: string;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stockQuantity: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    imageUrl: { type: String },
    isFeatured: { type: Boolean, default: false },
    syncSessionId: { type: String },
  },
  { timestamps: true }
);

const MongooseProductModel = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

const tableName = process.env.AIRTABLE_TABLE_PRODUCTS || 'products';
const airtableProductRepo = new AirtableRepository<IProduct>(tableName);

class HybridProduct {
  id?: string;
  _id?: string;
  name!: string;
  description!: string;
  price!: number;
  stockQuantity!: number;
  category!: string;
  imageUrl!: string;
  isFeatured!: boolean;
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
        const updated = await airtableProductRepo.findByIdAndUpdate(this.id, cleanData);
        Object.assign(this, updated);
      } else {
        const created = await airtableProductRepo.create(cleanData);
        Object.assign(this, created);
      }

      // Background dual-write
      MongooseProductModel.findOne({ name: this.name }).exec().then(existing => {
        const payload = {
          name: this.name,
          description: this.description,
          price: this.price,
          stockQuantity: this.stockQuantity,
          category: this.category,
          imageUrl: this.imageUrl,
          isFeatured: this.isFeatured
        };
        if (existing) {
          MongooseProductModel.findByIdAndUpdate(existing.id, payload).exec().catch(() => { });
        } else {
          new MongooseProductModel(payload).save().catch(() => { });
        }
      }).catch(() => { });
    } else {
      let mongoDoc;
      if (this._id && !String(this._id).startsWith('rec')) {
        mongoDoc = await MongooseProductModel.findByIdAndUpdate(this._id, cleanData, { new: true });
      } else {
        const newDoc = new MongooseProductModel(cleanData);
        mongoDoc = await newDoc.save();
      }
      Object.assign(this, mongoDoc.toObject());
    }
    return this;
  }
}

const ProductFacade = {
  find(query: any = {}): HybridQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      if (query._id) {
        return new HybridQuery(airtableProductRepo.findById(query._id).then(r => r ? [r] : []));
      }
      return new HybridQuery(airtableProductRepo.find(query));
    } else {
      return new HybridQuery(MongooseProductModel.find(query).exec(), MongooseProductModel.find(query));
    }
  },

  findOne(query: any = {}): HybridSingleQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      if (query._id) {
        return new HybridSingleQuery(airtableProductRepo.findById(query._id));
      }
      return new HybridSingleQuery(airtableProductRepo.findOne(query));
    } else {
      return new HybridSingleQuery(MongooseProductModel.findOne(query).exec(), MongooseProductModel.findOne(query));
    }
  },

  findById(id: string): HybridSingleQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      return new HybridSingleQuery(airtableProductRepo.findById(id));
    } else {
      return new HybridSingleQuery(MongooseProductModel.findById(id).exec(), MongooseProductModel.findById(id));
    }
  },

  findByIdAndUpdate(id: string, update: any, options: any = {}): Promise<any | null> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      MongooseProductModel.findByIdAndUpdate(id, update).exec().catch(() => { });
      return airtableProductRepo.findByIdAndUpdate(id, update);
    } else {
      return MongooseProductModel.findByIdAndUpdate(id, update, { new: true }).exec().then(doc => doc ? doc.toObject() : null);
    }
  },

  findOneAndUpdate(query: any, update: any, options: any = {}): Promise<any | null> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      MongooseProductModel.findOneAndUpdate(query, update).exec().catch(() => { });
      return airtableProductRepo.findOneAndUpdate(query, update);
    } else {
      return MongooseProductModel.findOneAndUpdate(query, update, { new: true }).exec().then(doc => doc ? doc.toObject() : null);
    }
  },

  insertMany(docs: any[]): Promise<any> {
    return MongooseProductModel.insertMany(docs);
  },

  deleteMany(filter: any): Promise<any> {
    return MongooseProductModel.deleteMany(filter);
  },

  findByIdAndDelete(id: string): Promise<any | null> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      MongooseProductModel.findByIdAndDelete(id).exec().catch(() => { });
      return airtableProductRepo.delete(id);
    } else {
      return MongooseProductModel.findByIdAndDelete(id).exec().then(doc => doc ? doc.toObject() : null);
    }
  }
};

const ProductConstructor = function (this: any, data: any) {
  return new HybridProduct(data);
} as any as {
  new(data: any): HybridProduct;
  find(query?: any): HybridQuery<any>;
  findOne(query?: any): HybridSingleQuery<any>;
  findById(id: string): HybridSingleQuery<any>;
  findByIdAndUpdate(id: string, update: any, options?: any): Promise<any | null>;
  findOneAndUpdate(query: any, update: any, options?: any): Promise<any | null>;
  insertMany(docs: any[]): Promise<any>;
  deleteMany(filter: any): Promise<any>;
  findByIdAndDelete(id: string): Promise<any | null>;
};

Object.assign(ProductConstructor, ProductFacade);

export default ProductConstructor;
