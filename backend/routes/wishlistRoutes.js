import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getWishlist)
  .post(addToWishlist);

router.route('/:id').delete(removeFromWishlist);
router.route('/move-to-cart/:id').post(moveToCart);

export default router;
