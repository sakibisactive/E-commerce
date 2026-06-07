import express from 'express';
import {
  getActiveCampaigns,
  createCampaign,
  getCampaignsAdmin,
  updateCampaign,
  deleteCampaign,
} from '../controllers/campaignController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getActiveCampaigns);
router.route('/all').get(protect, admin, getCampaignsAdmin);
router.route('/').post(protect, admin, createCampaign);

router
  .route('/:id')
  .put(protect, admin, updateCampaign)
  .delete(protect, admin, deleteCampaign);

export default router;
