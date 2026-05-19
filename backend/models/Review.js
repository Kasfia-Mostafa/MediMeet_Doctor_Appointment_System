/**
 * ============================================================
 * Review Model — Mongoose Schema
 * ============================================================
 * Stores patient reviews/ratings for doctors. One review per
 * patient per doctor (enforced by compound unique index).
 * ============================================================
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent user from submitting multiple reviews for the same doctor
reviewSchema.index({ doctor: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
