/**
 * ============================================================
 * Wellness Routes — /api/wellness
 * ============================================================
 * Defines routes for the patient wellness tracker feature.
 * All routes require authentication and are restricted to
 * patients only (via roleAuth middleware).
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { getTodayWellness, updateWellness, getWellnessHistory } = require('../controllers/wellnessController');
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// All wellness routes require authentication + patient role
router.use(protect);
router.use(roleAuth('patient')); // Only patients can use wellness tracker

router.get('/today', getTodayWellness);       // GET  /api/wellness/today   — Get today's wellness log
router.post('/today', updateWellness);        // POST /api/wellness/today   — Create/update today's log
router.get('/history', getWellnessHistory);   // GET  /api/wellness/history — Get last 7 days of history

module.exports = router;
