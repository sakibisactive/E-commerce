import express from 'express';
import { getDashboardAnalytics } from '../controllers/dashboardController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/analytics').get(protect, admin, getDashboardAnalytics);

export default router;
