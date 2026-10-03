import mongoose from 'mongoose';

const faceDataSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true,
    },
    // Array of numbers representing the face embedding vector
    descriptors: {
      type: [[Number]],
      required: [true, 'Face descriptor embeddings are required'],
    },
    modelVersion: {
      type: String,
      default: 'v1.0',
    },
    qualityScore: {
      type: Number,
      default: 1.0,
    },
  },
  {
    timestamps: true,
  }
);

const FaceData = mongoose.model('FaceData', faceDataSchema);
export default FaceData;