import FaceData from '../models/FaceData.js';
import Student from '../models/Student.js';
import { findBestMatch } from '../services/faceService.js';

// @desc    Register Student Face Embedding Descriptors
// @route   POST /api/face/register
// @access  Private (Student / Admin)
export const registerFace = async (req, res) => {
  try {
    const { studentId, descriptors, qualityScore } = req.body;

    if (!descriptors || !Array.isArray(descriptors) || descriptors.length === 0) {
      return res.status(400).json({ message: 'Valid face descriptors array required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Check karein ki pehle se face data present hai ya nahi
    let faceRecord = await FaceData.findOne({ student: studentId });

    if (faceRecord) {
      // Existing profile me descriptors update karein
      faceRecord.descriptors = descriptors;
      faceRecord.qualityScore = qualityScore || 1.0;
      await faceRecord.save();
    } else {
      // Naya FaceData document banayein
      faceRecord = await FaceData.create({
        student: studentId,
        descriptors,
        qualityScore: qualityScore || 1.0,
      });
    }

    // Student profile ka face status update karein
    student.faceRegistrationStatus = 'REGISTERED';
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Face biometrics registered successfully',
      data: faceRecord,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Live Face Descriptor against Database
// @route   POST /api/face/verify
// @access  Private
export const verifyFace = async (req, res) => {
  try {
    const { liveDescriptor, expectedStudentId } = req.body;

    if (!liveDescriptor || !Array.isArray(liveDescriptor)) {
      return res.status(400).json({ message: 'Live face descriptor vector is required' });
    }

    // Sabhi active registered faces populate karein
    const allRegisteredFaces = await FaceData.find().populate({
      path: 'student',
      populate: { path: 'user', select: 'name email' },
    });

    if (allRegisteredFaces.length === 0) {
      return res.status(404).json({ message: 'No registered face biometrics found in system' });
    }

    // Vector matching perform karein
    const matchResult = findBestMatch(liveDescriptor, allRegisteredFaces, 0.45);

    if (!matchResult.isMatched) {
      return res.status(401).json({
        success: false,
        message: 'Face match failed. Student identity could not be verified.',
      });
    }

    // Agar expectedStudentId bheja gaya ho toh cross-verify karein
    if (expectedStudentId && matchResult.match.studentId.toString() !== expectedStudentId) {
      return res.status(403).json({
        success: false,
        message: 'Identity mismatch! Face does not belong to the logged-in student.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Face identity verified successfully',
      student: matchResult.match.studentDetails,
      confidence: matchResult.confidence.toFixed(2) + '%',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Face Biometrics Status by Student ID
// @route   GET /api/face/status/:studentId
// @access  Private
export const getFaceStatus = async (req, res) => {
  try {
    const faceRecord = await FaceData.findOne({ student: req.params.studentId });

    if (!faceRecord) {
      return res.status(200).json({ registered: false, message: 'Face data not registered' });
    }

    res.status(200).json({
      registered: true,
      updatedAt: faceRecord.updatedAt,
      qualityScore: faceRecord.qualityScore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};