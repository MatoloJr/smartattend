import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  session: mongoose.Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  recordedBy: mongoose.Types.ObjectId;
  notes?: string;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    session: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    date: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      required: true,
      enum: ['present', 'absent', 'late', 'excused'],
    },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: String,
  },
  { timestamps: true }
);

// Create compound index for better query performance
attendanceSchema.index({ student: 1, session: 1 }, { unique: true });
attendanceSchema.index({ student: 1, course: 1, date: 1 });

const Attendance = mongoose.models.Attendance || 
  mongoose.model<IAttendance>('Attendance', attendanceSchema);

export default Attendance;