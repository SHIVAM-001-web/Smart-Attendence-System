import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 1. Protect Middleware: Check karta hai ki User logged in hai ya nahi
export const protect = async (req, res, next) => {
  let token;

  // Header me check karein: Authorization: Bearer <TOKEN>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 'Bearer ' ke baad wala actual token alag karte hain
      token = req.headers.authorization.split(' ')[1];

      // Token verify karte hain secret key se
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Token se User find karke req.user me attach kar dete hain (Password ko chhodkar)
      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found / Invalid Token' });
      }

      next(); // Agle step par bhejo
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// 2. Admin Middleware: Check karta hai ki user ADMIN hai ya nahi
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin rights required' });
  }
};