/**
 * ============================================================
 * Review Controller — Doctor Review System
 * ============================================================
 * Handles the review/rating system for doctors. Patients can
 * add, update, and delete reviews. Each review triggers a
 * recalculation of the doctor's aggregate rating and total
 * review count. One review per patient per doctor is enforced.
 * ============================================================
 */

const Review = require('../models/Review');
const Doctor = require('../models/Doctor');

/**
 * @desc    Add a new review for a doctor
 * @route   POST /api/reviews
 * @access  Private (Patient only)
 *
 * Validates role, checks for duplicates, creates the review,
 * then recalculates the doctor's aggregate rating.
 */
const addReview = async (req, res, next) => {
  try {
    const { doctorId, rating, comment } = req.body;
    
    // 1. Role verification — only patients can submit reviews
    if (req.user.role !== 'patient') {
      res.status(403);
      throw new Error('Clinical feedback can only be submitted by patients');
    }

    // 2. Verify the doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      res.status(404);
      throw new Error('Healthcare provider record not found');
    }

    // 3. Check for duplicate review (one per patient per doctor)
    const existingReview = await Review.findOne({ doctor: doctorId, user: req.user._id });
    if (existingReview) {
      res.status(400);
      throw new Error('You have already shared your experience for this provider');
    }

    // 4. Create the review
    const review = await Review.create({
      doctor: doctorId,
      user: req.user._id,
      rating: Number(rating),
      comment: comment.trim()
    });

    // 5. Recalculate the doctor's aggregate rating
    const allReviews = await Review.find({ doctor: doctorId });
    const count = allReviews.length;
    const avg = allReviews.reduce((acc, item) => item.rating + acc, 0) / count;

    await Doctor.findByIdAndUpdate(doctorId, {
      rating: avg || rating,
      totalReviews: count
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('CRITICAL: Review Submission Failure', error);
    next(error);
  }
};

/**
 * @desc    Get all reviews for a specific doctor
 * @route   GET /api/reviews/doctor/:id
 * @access  Public
 */
const getDoctorReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ doctor: req.params.id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing review (only by the original author)
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    
    // 1. Fetch review
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404);
      throw new Error('Clinical feedback record not found');
    }

    // 2. Authorization — only the original author can modify
    if (review.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized: You can only modify your own feedback');
    }

    // 3. Apply updates
    if (rating) review.rating = Number(rating);
    if (comment) review.comment = comment.trim();
    await review.save();

    // 4. Recalculate the doctor's aggregate rating
    const allReviews = await Review.find({ doctor: review.doctor });
    const count = allReviews.length;
    const avg = count > 0 ? (allReviews.reduce((acc, item) => item.rating + acc, 0) / count) : 0;

    await Doctor.findByIdAndUpdate(review.doctor, {
      rating: avg,
      totalReviews: count
    });

    res.json(review);
  } catch (error) {
    console.error('Update Review Error:', error);
    next(error);
  }
};

/**
 * @desc    Get all reviews written by the authenticated user
 * @route   GET /api/reviews/me
 * @access  Private
 */
const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate({
        path: 'doctor',
        select: 'user specialization',
        populate: {
          path: 'user',
          select: 'name avatar'
        }
      })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('FETCH REVIEWS ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Delete a review (only by the original author)
 * @route   DELETE /api/reviews/:id
 * @access  Private
 *
 * After deletion, recalculates the doctor's aggregate rating.
 */
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    // Authorization check
    if (review.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const doctorId = review.doctor;
    await review.deleteOne();

    // Recalculate ratings after deletion
    const allReviews = await Review.find({ doctor: doctorId });
    const count = allReviews.length;
    const avg = count > 0 ? (allReviews.reduce((acc, item) => item.rating + acc, 0) / count) : 0;

    await Doctor.findByIdAndUpdate(doctorId, {
      rating: avg,
      totalReviews: count
    });

    res.json({ message: 'Review removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { addReview, getDoctorReviews, updateReview, getMyReviews, deleteReview };
