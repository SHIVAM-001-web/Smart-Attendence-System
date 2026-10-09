import Session from '../models/Session.js';

// @desc    Create a new class session
// @route   POST /api/sessions
// @access  Private/Admin
export const createSession = async (req, res) => {
  try {
    const { className, subject, date, startTime, endTime } = req.body;

    const session = await Session.create({
      className,
      subject,
      createdBy: req.user._id,
      date,
      startTime,
      endTime,
      status: 'UPCOMING',
    });

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: session,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sessions
// @route   GET /api/sessions
// @access  Private
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update session status (e.g., ACTIVE, COMPLETED)
// @route   PUT /api/sessions/:id
// @access  Private/Admin
export const updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.status = status || session.status;
    const updatedSession = await session.save();

    res.status(200).json({
      success: true,
      message: 'Session status updated',
      data: updatedSession,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};