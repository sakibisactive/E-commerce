import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Optional user lookup to show hidden categories to admin even on public route
const optionalUser = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_for_local_development_123456');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // ignore token verification errors for optional routes
    }
  }
  next();
};

router
  .route('/')
  .get(optionalUser, getCategories)
  .post(protect, admin, createCategory);

router
  .route('/:id')
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

export default router;
