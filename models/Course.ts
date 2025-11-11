import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule {
  day: string;
  startTime: string;
  endTime: string;
  location: string;
}

interface ICourseBase {
  code: string;
  name: string;
  description?: string;
  department: string;
  faculty: mongoose.Types.ObjectId;
  credits: number;
  duration: number; // in minutes
  enrolledStudents: number;
  maxCapacity: number;
  schedules: ISchedule[];
  semester: string;
  year: number;
  status: 'active' | 'inactive' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourse extends Document, ICourseBase {
  _id: mongoose.Types.ObjectId;
  __v?: number;
}

const scheduleSchema = new Schema<ISchedule>({
  day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, required: true },
});

const courseSchema = new Schema<ICourse>(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    department: { type: String, required: true, trim: true },
    faculty: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    credits: { type: Number, required: true, min: 1, max: 10 },
    duration: { type: Number, required: true, min: 30, max: 180 }, // 30min to 3 hours
    enrolledStudents: { type: Number, default: 0, min: 0 },
    maxCapacity: { type: Number, required: true, min: 1 },
    schedules: [scheduleSchema],
    semester: { type: String, required: true, enum: ['Fall', 'Spring', 'Summer', 'Winter'] },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'completed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

courseSchema.index({ faculty: 1, status: 1 });
courseSchema.index({ department: 1, status: 1 });

// Create a compound index for course code and name for better search performance
courseSchema.index({ code: 'text', name: 'text', department: 'text' });

// Check if the model already exists before creating it
const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema);

export default Course;
