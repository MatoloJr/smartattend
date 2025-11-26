import mongoose, { Document, Schema } from 'mongoose';

export interface IInstitution extends Document {
  name: string;
  domain: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  primaryCampus: {
    name: string;
    location: string;
    country: string;
  };
  additionalCampuses?: Array<{
    name?: string;
    location?: string;
    country?: string;
  }>;
  settings?: {
    attendanceThreshold?: number;
    sessionDuration?: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const institutionSchema = new Schema<IInstitution>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  domain: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },
  contact: {
    email: String,
    phone: String,
    website: String,
  },
  primaryCampus: {
    name: {
      type: String,
      required: [true, 'Primary campus name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Primary campus location is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Primary campus country is required'],
      trim: true,
    },
  },
  additionalCampuses: [{
    name: String,
    location: String,
    country: String,
  }],
  settings: {
    attendanceThreshold: {
      type: Number,
      default: 75, // Default 75% attendance threshold
    },
    sessionDuration: {
      type: Number,
      default: 60, // Default 60 minutes per session
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
institutionSchema.pre<IInstitution>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default (mongoose.models.Institution as mongoose.Model<IInstitution>) ||
  mongoose.model<IInstitution>('Institution', institutionSchema);
