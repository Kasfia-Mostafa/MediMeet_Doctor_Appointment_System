/**
 * ============================================================
 * Payment Routes — /api/payments
 * ============================================================
 * Defines routes for Stripe payment processing.
 * All routes require authentication.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { createPaymentIntent } = require('../controllers/paymentController');

// POST /api/payments/create-intent — Create a Stripe PaymentIntent for appointment booking
router.post('/create-intent', protect, createPaymentIntent);

module.exports = router;
