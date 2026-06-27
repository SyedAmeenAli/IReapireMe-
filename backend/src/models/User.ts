import mongoose, { Document, Schema } from 'mongoose';
import { AirtableRepository, HybridQuery, HybridSingleQuery } from './airtable.repository';

export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  address?: string;
  cart?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.CUSTOMER },
    phone: { type: String },
    address: { type: String },
    cart: { type: String } // Stringified JSON cart array
  },
  { timestamps: true }
);

const MongooseUserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// Schema Validator for User
function validateUser(data: any) {
  if (data.email && !data.email.includes('@')) {
    throw new Error('400: Invalid email format.');
  }
}

const tableName = process.env.AIRTABLE_TABLE_USERS || 'users';
const airtableUserRepo = new AirtableRepository<IUser>(tableName, validateUser);

// The Hybrid Instance Constructor Class
class HybridUser {
  id?: string;
  _id?: string;
  name!: string;
  email!: string;
  passwordHash!: string;
  role!: UserRole;
  phone?: string;
  address?: string;
  cart?: string;
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
        const updated = await airtableUserRepo.findByIdAndUpdate(this.id, cleanData);
        Object.assign(this, updated);
      } else {
        const created = await airtableUserRepo.create(cleanData);
        Object.assign(this, created);
      }

      // Background asynchronous dual-write to MongoDB for evaluation parity
      MongooseUserModel.findOne({ email: this.email }).exec().then(existingMongoUser => {
        const mongoPayload = {
          name: this.name,
          email: this.email,
          passwordHash: this.passwordHash,
          role: this.role,
          phone: this.phone,
          address: this.address,
          cart: this.cart
        };
        if (existingMongoUser) {
          MongooseUserModel.findByIdAndUpdate(existingMongoUser.id, mongoPayload).exec().catch((err: any) => {
            console.error('[Dual-Write Error] User background update to MongoDB failed:', err);
          });
        } else {
          new MongooseUserModel(mongoPayload).save().catch((err: any) => {
            console.error('[Dual-Write Error] User background insert to MongoDB failed:', err);
          });
        }
      }).catch((err: any) => {
        console.error('[Dual-Write Error] User MongoDB lookup failed:', err);
      });

    } else {
      // Primary MongoDB save
      let mongoDoc;
      if (this._id && !String(this._id).startsWith('rec')) {
        mongoDoc = await MongooseUserModel.findByIdAndUpdate(this._id, cleanData, { new: true });
      } else {
        const newDoc = new MongooseUserModel(cleanData);
        mongoDoc = await newDoc.save();
      }
      Object.assign(this, mongoDoc.toObject());
    }

    return this;
  }
}

// Export the Hybrid Facade Object mimicking Mongoose static operations
const UserFacade = {
  find(query: any = {}): HybridQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      if (query._id) {
        return new HybridQuery(airtableUserRepo.findById(query._id).then(r => r ? [r] : []));
      }
      return new HybridQuery(airtableUserRepo.find(query));
    } else {
      return new HybridQuery(MongooseUserModel.find(query).exec(), MongooseUserModel.find(query));
    }
  },

  findOne(query: any = {}): HybridSingleQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      if (query._id) {
        return new HybridSingleQuery(airtableUserRepo.findById(query._id));
      }
      return new HybridSingleQuery(airtableUserRepo.findOne(query));
    } else {
      return new HybridSingleQuery(MongooseUserModel.findOne(query).exec(), MongooseUserModel.findOne(query));
    }
  },

  findById(id: string): HybridSingleQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      return new HybridSingleQuery(airtableUserRepo.findById(id));
    } else {
      return new HybridSingleQuery(MongooseUserModel.findById(id).exec(), MongooseUserModel.findById(id));
    }
  },

  findByIdAndUpdate(id: string, update: any, options: any = {}): Promise<any | null> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      // Background dual-write
      MongooseUserModel.findByIdAndUpdate(id, update).exec().catch(() => {});
      return airtableUserRepo.findByIdAndUpdate(id, update);
    } else {
      return MongooseUserModel.findByIdAndUpdate(id, update, { new: true }).exec().then(doc => doc ? doc.toObject() : null);
    }
  },

  findOneAndUpdate(query: any, update: any, options: any = {}): Promise<any | null> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      // Background dual-write
      MongooseUserModel.findOneAndUpdate(query, update).exec().catch(() => {});
      return airtableUserRepo.findOneAndUpdate(query, update);
    } else {
      return MongooseUserModel.findOneAndUpdate(query, update, { new: true }).exec().then(doc => doc ? doc.toObject() : null);
    }
  }
};

// Re-bind construction to allow `new User(...)`
const UserConstructor = function(this: any, data: any) {
  return new HybridUser(data);
} as any as {
  new (data: any): HybridUser;
  find(query?: any): HybridQuery<any>;
  findOne(query?: any): HybridSingleQuery<any>;
  findById(id: string): HybridSingleQuery<any>;
  findByIdAndUpdate(id: string, update: any, options?: any): Promise<any | null>;
  findOneAndUpdate(query: any, update: any, options?: any): Promise<any | null>;
};

Object.assign(UserConstructor, UserFacade);

export default UserConstructor;
