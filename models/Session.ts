import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  sessionCode: string;
  course: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    sessionCode: { 
      type: String, 
      required: true,
      unique: true,
      match: /^[A-Z0-9]{3}-[A-Z0-9]{4}$/ // Format: ABC-1234
    },
    course: { 
      type: Schema.Types.ObjectId, 
      ref: 'Course', 
      required: true 
    },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    expiresAt: { 
      type: Date, 
      required: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
  },
  { 
    timestamps: true 
  }
);

// Index for faster lookups
sessionSchema.index({ sessionCode: 1, isActive: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-expiration

export default mongoose.models.Session || 
  mongoose.model<ISession>('Session', sessionSchema);
