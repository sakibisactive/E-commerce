import express from 'express';
import {
  validateCoupon,
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/validate', protect, validateCoupon);

router
  .route('/')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);

router
  .route('/:id')
  .put(protect, admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

export default router;
