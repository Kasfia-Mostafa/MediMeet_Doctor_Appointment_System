const express = require('express');
const router = express.Router();
const { addReview, getDoctorReviews, updateReview, getMyReviews, deleteReview } = require('../controllers/reviewController');
const protect = require('../middleware/auth');

router.post('/', protect, addReview);
router.get('/me', protect, getMyReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.get('/doctor/:id', getDoctorReviews);

module.exports = router;
