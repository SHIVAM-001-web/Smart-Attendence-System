import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE'],
      default: 'PRESENT',
    },
    verificationMethod: {
      type: String,
      enum: ['FACE_RECOGNITION', 'MANUAL_OVERRIDE'],
      default: 'FACE_RECOGNITION',
    },
    confidenceScore: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance for the same student in the same session
attendanceSchema.index({ student: 1, session: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;