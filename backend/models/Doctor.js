/**
 * ============================================================
 * Doctor Model — Mongoose Schema
 * ============================================================
 * 
 * Defines the Doctor profile document. Each Doctor document is
 * linked to a User document (1:1 relationship via the `user`
 * field). Stores professional information, scheduling data,
 * and aggregate review metrics.
 * 
 * Key relationships:
 *  - user → User model (ObjectId reference, unique per doctor)
 *  - Referenced by: Appointment, Review models
 * 
 * Features:
 *  - Available days and configurable time slots per day
 *  - Text index on specialization for search functionality
 *  - Rating and review count for public listings
 * ============================================================
 */

const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    // ── User Reference (1:1 Relationship) ──────────────────
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // ── Professional Information ───────────────────────────
    specialization: { type: String, required: true },     // e.g., "Cardiology", "Dermatology"
    qualification: { type: String, required: true },      // e.g., "MBBS, MD"
    experience: { type: Number, default: 0 },             // Years of experience
    consultationFee: { type: Number, required: true },    // Fee per appointment (in BDT)
    bio: { type: String, default: '' },                   // Short biography/description
    languages: [{ type: String }],                        // Languages spoken
    hospital: { type: String, default: '' },              // Primary hospital/clinic
    location: { type: String, default: '' },              // Office location
    department: { type: String, default: '' },            // Hospital department

    // ── Schedule Configuration ─────────────────────────────
    // Days of the week the doctor is available
    availableDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
    // Detailed time slots for each available day
    timeSlots: [
      {
        day: { type: String, required: true },            // Day of the week (e.g., "monday")
        startTime: { type: String, required: true },      // Start time in HH:mm format
        endTime: { type: String, required: true },        // End time in HH:mm format
        maxPatients: { type: Number, default: 10 },       // Max patients per slot window
      },
    ],

    // ── Review Metrics (Aggregated) ────────────────────────
    rating: { type: Number, default: 0, min: 0, max: 5 },  // Average rating (0–5 stars)
    totalReviews: { type: Number, default: 0 },             // Total number of reviews
    totalPatients: { type: Number, default: 0 },            // Lifetime patient count

    // ── Availability Flag ──────────────────────────────────
    isAvailable: { type: Boolean, default: true },          // Can be toggled by doctor or admin
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

// Text index on specialization to support keyword search queries
doctorSchema.index({ specialization: 'text' });

module.exports = mongoose.model('Doctor', doctorSchema);
