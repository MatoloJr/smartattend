import mongoose, { Document, Schema } from 'mongoose';

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'DROPPED';
  enrollmentDate: Date;
  completionDate?: Date;
  grade?: string;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  student: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  course: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course',
    required: true 
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'COMPLETED', 'DROPPED'],
    default: 'ACTIVE',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  completionDate: {
    type: Date
  },
  grade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F', 'P', 'NP', null],
    default: null
  }
}, {
  timestamps: true
});

// Add compound index to prevent duplicate enrollments
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.models.Enrollment || 
  mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
