import express from 'express';
import {
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN,
  getMockGateway,
} from '../controllers/paymentController.js';

const router = express.Router();

// Public routes for payment gateway callbacks
router.get('/mock-gateway', getMockGateway);
router.post('/success', paymentSuccess);
router.post('/fail', paymentFail);
router.post('/cancel', paymentCancel);
router.post('/ipn', paymentIPN);

export default router;
