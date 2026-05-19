/**
 * ============================================================
 * Billing Routes — /api/billing
 * ============================================================
 * Defines routes for billing/invoice operations.
 * All routes require authentication. Creating bills is
 * restricted to admins only.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { getBills, createBill, payBill } = require('../controllers/billingController');
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// All billing routes require authentication
router.use(protect);

router.get('/', getBills);                          // GET  /api/billing         — List bills (filtered by role)
router.post('/', roleAuth('admin'), createBill);    // POST /api/billing         — Create bill (admin only)
router.put('/:id/pay', payBill);                    // PUT  /api/billing/:id/pay — Mark bill as paid

module.exports = router;
