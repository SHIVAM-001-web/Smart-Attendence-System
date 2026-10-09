import Student from '../models/Student.js';
import User from '../models/User.js';

// @desc    Create a new student profile (Admin only)
// @route   POST /api/students
// @access  Private/Admin
export const createStudent = async (req, res) => {
  try {
    const { userId, studentId, department, course } = req.body;

    // Check karein user exist karta hai ya nahi
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check karein student profile pehle se toh nahi bani hui
    const studentExists = await Student.findOne({
      $or: [{ user: userId }, { studentId }],
    });

    if (studentExists) {
      return res
        .status(400)
        .json({ message: 'Student profile or Student ID already exists' });
    }

    const student = await Student.create({
      user: userId,
      studentId,
      department,
      course,
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all students (Admin only)
// @route   GET /api/students
// @access  Private/Admin
export const getStudents = async (req, res) => {
  try {
    // Populate user object details (name, email)
    const students = await Student.find()
      .populate('user', 'name email role status')
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single student profile by ID
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      'user',
      'name email role status'
    );

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update student profile details
// @route   PUT /api/students/:id
// @access  Private/Admin
export const updateStudent = async (req, res) => {
  try {
    const { department, course, status, faceRegistrationStatus } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    student.department = department || student.department;
    student.course = course || student.course;
    student.status = status || student.status;
    student.faceRegistrationStatus =
      faceRegistrationStatus || student.faceRegistrationStatus;

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete student profile
// @route   DELETE /api/students/:id
// @access  Private/Admin
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    await student.deleteOne();
    res.json({ message: 'Student profile removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged in student profile
// @route   GET /api/students/profile/me
// @access  Private (Student)
export const getMyStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate(
      'user',
      'name email role'
    );

    if (!student) {
      return res
        .status(404)
        .json({ message: 'Student profile not found for logged in user' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};