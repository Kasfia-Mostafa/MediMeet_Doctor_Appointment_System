/**
 * ============================================================
 * Wellness Model — Mongoose Schema
 * ============================================================
 * Tracks daily health metrics and wellness goals for patients.
 * One entry per patient per day (enforced by compound index).
 * ============================================================
 */

const mongoose = require('mongoose');

const wellnessSchema = new mongoose.Schema(
  {
    // ── Reference ──────────────────────────────────────────
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },              // Date of the wellness log entry

    // ── Health Metrics ─────────────────────────────────────
    metrics: {
      heartRate: { type: Number, default: 0 },         // Beats per minute
      bloodPressure: { type: String, default: '' },     // e.g., "120/80"
      temperature: { type: Number, default: 0 },        // Body temperature
      oxygen: { type: Number, default: 0 },              // SpO2 percentage
      weight: { type: Number, default: 0 },              // Weight in kg
    },

    // ── Daily Goals ────────────────────────────────────────
    goals: {
      steps: { type: Number, default: 0 },               // Step count
      water: { type: Number, default: 0 },               // Water intake (glasses)
      sleep: { type: Number, default: 0 },               // Sleep hours
    },
  },
  { timestamps: true }
);

// Ensure only one log per patient per day
wellnessSchema.index({ patient: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Wellness', wellnessSchema);
