const express = require('express');
const router = express.Router();
const { getTodayWellness, updateWellness, getWellnessHistory } = require('../controllers/wellnessController');
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.use(protect);
router.use(roleAuth('patient')); // Only patients can use wellness tracker

router.get('/today', getTodayWellness);
router.post('/today', updateWellness);
router.get('/history', getWellnessHistory);

module.exports = router;
