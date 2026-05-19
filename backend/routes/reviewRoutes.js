/**
 * ============================================================
 * Review Routes — /api/reviews
 * ============================================================
 * Defines routes for the doctor review system. Public route
 * for fetching doctor reviews. Private routes for submitting,
 * updating, deleting, and viewing own reviews.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { addReview, getDoctorReviews, updateReview, getMyReviews, deleteReview } = require('../controllers/reviewController');
const protect = require('../middleware/auth');

// Private routes (require authentication)
router.post('/', protect, addReview);                // POST   /api/reviews         — Submit a new review
router.get('/me', protect, getMyReviews);             // GET    /api/reviews/me      — Get my reviews
router.put('/:id', protect, updateReview);            // PUT    /api/reviews/:id     — Update a review
router.delete('/:id', protect, deleteReview);         // DELETE /api/reviews/:id     — Delete a review

// Public route
router.get('/doctor/:id', getDoctorReviews);          // GET    /api/reviews/doctor/:id — Get reviews for a doctor

module.exports = router;
