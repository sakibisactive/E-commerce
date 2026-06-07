import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (userId, actionType, metadata = {}) => {
  try {
    await ActivityLog.create({
      user: userId || null,
      actionType,
      metadata,
    });
  } catch (error) {
    console.error(`Activity Logging Error: ${error.message}`);
  }
};

// Optional Express Middleware to log request logs (like product view endpoints)
export const requestActivityLogger = (actionType) => {
  return async (req, res, next) => {
    // We can intercept successful requests to log views
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        let userId = req.user ? req.user._id : null;
        let metadata = {
          ip: req.ip,
          path: req.originalUrl,
          method: req.method,
        };

        if (actionType === 'Product View' && req.params.id) {
          metadata.productId = req.params.id;
        }

        await logActivity(userId, actionType, metadata);
      }
    });
    next();
  };
};
