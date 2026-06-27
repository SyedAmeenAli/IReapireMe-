import mongoose, { Document, Schema } from 'mongoose';
import { AirtableRepository, HybridQuery, HybridSingleQuery } from './airtable.repository';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  category: string;
  subcategory?: string;
  brand?: string;
  compatibleModels: string[];
  quality: string;
  rating: number;
  reviewCount: number;
  features: string[];
  imageUrl: string;
  slug?: string;
  isFeatured: boolean;
  createdAt: Date;
  syncSessionId?: string;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    stockQuantity: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    subcategory: { type: String },
    brand: { type: String },
    compatibleModels: { type: [String], default: [] },
    quality: { type: String, default: 'oem' },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    features: { type: [String], default: [] },
    imageUrl: { type: String },
    slug: { type: String },
    isFeatured: { type: Boolean, default: false },
    syncSessionId: { type: String },
  },
  { timestamps: true }
);

export function normalizeProduct(raw: any): any {
  if (!raw) return null;

  // Airtable keys can be Capitalized (Name, Price, etc.) or lowercase
  const name = raw.Name || raw.name || '';
  const description = raw.Description || raw.description || '';

  const price = typeof raw.Price === 'number' ? raw.Price : (typeof raw.price === 'number' ? raw.price : 0);
  const originalPrice = typeof raw.OriginalPrice === 'number' ? raw.OriginalPrice : (typeof raw.originalPrice === 'number' ? raw.originalPrice : undefined);

  const category = raw.Category || raw.category || 'spare-parts';
  const subcategory = raw.Subcategory || raw.subcategory || '';
  const brand = raw.Brand || raw.brand || '';

  // Parse compatibleModels (Airtable string -> Array)
  let compatibleModels: string[] = [];
  const rawCompatible = raw.CompatibleModels ?? raw.compatibleModels;
  if (Array.isArray(rawCompatible)) {
    compatibleModels = rawCompatible;
  } else if (typeof rawCompatible === 'string') {
    compatibleModels = rawCompatible.split(',').map((m: string) => m.trim()).filter(Boolean);
  }

  const quality = raw.Quality || raw.quality || 'oem';

  // Parse features (Airtable string -> Array)
  let features: string[] = [];
  const rawFeatures = raw.Features ?? raw.features;
  if (Array.isArray(rawFeatures)) {
    features = rawFeatures;
  } else if (typeof rawFeatures === 'string') {
    features = rawFeatures.split(',').map((f: string) => f.trim()).filter(Boolean);
  }

  let rating = typeof raw.Rating === 'number' ? raw.Rating : (typeof raw.rating === 'number' ? raw.rating : 5.0);
  if (rating > 5) {
    // Normalize rating scale from 0-100 down to 0-5
    rating = Math.round((rating / 20) * 10) / 10;
  }

  const reviewCount = typeof raw.ReviewCount === 'number' ? raw.ReviewCount : (typeof raw.reviewCount === 'number' ? raw.reviewCount : 0);

  const stockQuantity = typeof raw.StockCount === 'number' ? raw.StockCount :
                        (typeof raw.stockCount === 'number' ? raw.stockCount :
                        (typeof raw.stockQuantity === 'number' ? raw.stockQuantity : 0));

  const inStock = raw.InStock !== undefined ? (raw.InStock === true || raw.InStock === 1) : (stockQuantity > 0);

  const imageUrl = raw.Image || raw.image || raw.ImageUrl || raw.imageUrl || '/images/service-screen.jpg';

  let slug = raw.Slug || raw.slug;
  if (!slug && name) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  return {
    id: raw.id || raw._id,
    _id: raw.id || raw._id,
    name,
    description,
    price,
    originalPrice,
    category,
    subcategory,
    brand,
    compatibleModels,
    quality: quality.trim().toLowerCase(),
    features,
    rating,
    reviewCount,
    stockQuantity,
    inStock,
    imageUrl,
    slug,
    syncSessionId: raw.syncSessionId,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

const MongooseProductModel = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

const tableName = process.env.AIRTABLE_TABLE_PRODUCTS || 'products';
const airtableProductRepo = new AirtableRepository<IProduct>(tableName);

class HybridProduct {
  id?: string;
  _id?: string;
  name!: string;
  description!: string;
  price!: number;
  originalPrice?: number;
  stockQuantity!: number;
  category!: string;
  subcategory?: string;
  brand?: string;
  compatibleModels!: string[];
  quality!: string;
  rating!: number;
  reviewCount!: number;
  features!: string[];
  imageUrl!: string;
  slug?: string;
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
        Object.assign(this, normalizeProduct(updated));
      } else {
        const created = await airtableProductRepo.create(cleanData);
        Object.assign(this, normalizeProduct(created));
      }

      // Background dual-write
      MongooseProductModel.findOne({ name: this.name }).exec().then(existing => {
        const payload = {
          name: this.name,
          description: this.description,
          price: this.price,
          originalPrice: this.originalPrice,
          stockQuantity: this.stockQuantity,
          category: this.category,
          subcategory: this.subcategory,
          brand: this.brand,
          compatibleModels: this.compatibleModels,
          quality: this.quality,
          rating: this.rating,
          reviewCount: this.reviewCount,
          features: this.features,
          imageUrl: this.imageUrl,
          slug: this.slug,
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
      Object.assign(this, normalizeProduct(mongoDoc.toObject()));
    }
    return this;
  }
}

const ProductFacade = {
  find(query: any = {}): HybridQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      if (query._id) {
        return new HybridQuery(airtableProductRepo.findById(query._id).then(r => r ? [normalizeProduct(r)] : []));
      }
      return new HybridQuery(airtableProductRepo.find(query).then(records => records.map(normalizeProduct)));
    } else {
      const promise = MongooseProductModel.find(query).exec().then(records => records.map(r => normalizeProduct(r.toObject())));
      return new HybridQuery(promise, MongooseProductModel.find(query), normalizeProduct);
    }
  },

  findOne(query: any = {}): HybridSingleQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      if (query._id) {
        return new HybridSingleQuery(airtableProductRepo.findById(query._id).then(normalizeProduct));
      }
      return new HybridSingleQuery(airtableProductRepo.findOne(query).then(normalizeProduct));
    } else {
      const promise = MongooseProductModel.findOne(query).exec().then(doc => doc ? normalizeProduct(doc.toObject()) : null);
      return new HybridSingleQuery(promise, MongooseProductModel.findOne(query), normalizeProduct);
    }
  },

  findById(id: string): HybridSingleQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      return new HybridSingleQuery(airtableProductRepo.findById(id).then(normalizeProduct));
    } else {
      const promise = MongooseProductModel.findById(id).exec().then(doc => doc ? normalizeProduct(doc.toObject()) : null);
      return new HybridSingleQuery(promise, MongooseProductModel.findById(id), normalizeProduct);
    }
  },

  findByIdAndUpdate(id: string, update: any, options: any = {}): Promise<any | null> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      MongooseProductModel.findByIdAndUpdate(id, update).exec().catch(() => { });
      return airtableProductRepo.findByIdAndUpdate(id, update).then(normalizeProduct);
    } else {
      return MongooseProductModel.findByIdAndUpdate(id, update, { new: true }).exec().then(doc => doc ? normalizeProduct(doc.toObject()) : null);
    }
  },

  findOneAndUpdate(query: any, update: any, options: any = {}): Promise<any | null> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      MongooseProductModel.findOneAndUpdate(query, update).exec().catch(() => { });
      return airtableProductRepo.findOneAndUpdate(query, update).then(normalizeProduct);
    } else {
      return MongooseProductModel.findOneAndUpdate(query, update, { new: true }).exec().then(doc => doc ? normalizeProduct(doc.toObject()) : null);
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
      return airtableProductRepo.delete(id).then(normalizeProduct);
    } else {
      return MongooseProductModel.findByIdAndDelete(id).exec().then(doc => doc ? normalizeProduct(doc.toObject()) : null);
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
