const express = require('express');
const router = express.Router();
const { getBills, createBill, payBill } = require('../controllers/billingController');
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.use(protect);
router.get('/', getBills);
router.post('/', roleAuth('admin'), createBill);
router.put('/:id/pay', payBill);

module.exports = router;
