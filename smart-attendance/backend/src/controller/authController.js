import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user (Admin / Student)
// @route   POST /api/auth/register
// @access  Public / Admin
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check karein ki user pehle se registered hai ya nahi
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Naya user create karein (User Schema ka pre-save automatically password hash kar dega)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'STUDENT',
    });

    if (user) {
      const token = generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check karein user email se exist karta hai (aur explicitly password mangwayein)
    const user = await User.findOne({ email }).select('+password');

    // Email check + Match Password method execution
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(res, user._id);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};