import Session from '../models/Session.js';

export const startSession = async (req, res) => {
  try {
    const { className, subject, startTime, endTime } = req.body;

    // Purane baki saare sessions ko close kar do
    await Session.updateMany({ status: 'ACTIVE' }, { status: 'CLOSED' });

    const newSession = await Session.create({
      className: className || 'CS - Section A',
      subject: subject || 'General Subject',
      createdBy: req.user?._id,
      date: new Date(),
      startTime: startTime || new Date().toLocaleTimeString(),
      endTime: endTime || '05:00 PM',
      status: 'ACTIVE',
    });

    res.status(201).json({
      success: true,
      message: 'Session launched successfully!',
      data: newSession,
    });
  } catch (error) {
    console.error('Start Session Error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to start session on backend server.' 
    });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sessions.' });
  }
};