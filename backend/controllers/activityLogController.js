import ActivityLog from '../models/ActivityLog.js';

// @desc    Get all activity logs (Admin only)
// @route   GET /api/activity-logs
// @access  Private/Admin
export const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({})
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .limit(100);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving activity logs' });
  }
};
