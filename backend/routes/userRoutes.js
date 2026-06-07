import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getUsers,
  updateUserRole,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router
  .route('/addresses')
  .get(protect, getAddresses)
  .post(protect, addAddress);

router
  .route('/addresses/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.route('/').get(protect, admin, getUsers);
router.route('/:id/role').put(protect, admin, updateUserRole);

export default router;
