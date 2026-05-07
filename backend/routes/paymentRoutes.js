const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { createPaymentIntent } = require('../controllers/paymentController');

router.post('/create-intent', protect, createPaymentIntent);

module.exports = router;
