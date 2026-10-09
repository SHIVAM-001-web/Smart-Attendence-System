import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Student from '../models/Student.js';
import FaceData from '../models/FaceData.js';
import Session from '../models/Session.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Purana collections data clear karein
    await User.deleteMany();
    await Student.deleteMany();
    await FaceData.deleteMany();
    await Session.deleteMany();

    console.log('Purana data clear kar diya gaya...');

    // 1. Admin User Banayein
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@attendance.com',
      password: 'adminpassword123',
      role: 'ADMIN',
    });

    // 2. Student User Banayein
    const studentUser = await User.create({
      name: 'Shivam Badola',
      email: 'shivambadola369@gmail.com',
      password: 'yourpassword123',
      role: 'STUDENT',
    });

    // 3. Student Profile Banayein
    const studentProfile = await Student.create({
      user: studentUser._id,
      studentId: 'STU2026001',
      department: 'Computer Science',
      course: 'B.Tech Web Dev',
      faceRegistrationStatus: 'REGISTERED',
    });

    // 4. Dummy 128-Dimensional Face Biometric Descriptor Vector Insert Karein
    // Face-API ke format me 128 float values ka array chahiye hota hai
    const dummyDescriptor = Array.from({ length: 128 }, () => (Math.random() - 0.5) * 0.1);

    await FaceData.create({
      student: studentProfile._id,
      descriptors: [dummyDescriptor],
      qualityScore: 1.0,
    });

    // 5. Active Session Insert Karein (Attendance marking ke liye)
    await Session.create({
      className: 'B.Tech Web Dev',
      subject: 'Computer Vision & AI',
      createdBy: adminUser._id,
      date: new Date(),
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      status: 'ACTIVE',
    });

    console.log('-----------------------------------');
    console.log('Seed Data + Biometrics Successfully Inserted!');
    console.log('Admin Email: admin@attendance.com | Password: adminpassword123');
    console.log('Student Email: shivambadola369@gmail.com | Password: yourpassword123');
    console.log('-----------------------------------');

    process.exit();
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
};

seedData();