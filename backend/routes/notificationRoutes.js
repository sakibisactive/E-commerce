import express from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getNotifications);
router.route('/read-all').put(markAllNotificationsRead);
router.route('/:id/read').put(markNotificationRead);

export default router;
