import express from 'express';
import {
  addReview,
  updateReview,
  deleteReview,
  reportReview,
  getReportedReviews,
  getProductReviews,
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addReview);
router.route('/reported').get(protect, admin, getReportedReviews);
router.route('/product/:productId').get(getProductReviews);

router
  .route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.route('/:id/report').put(protect, reportReview);

export default router;
