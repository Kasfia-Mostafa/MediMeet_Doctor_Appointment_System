const mongoose = require('mongoose');

const wellnessSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    metrics: {
      heartRate: { type: Number, default: 0 },
      bloodPressure: { type: String, default: '' },
      temperature: { type: Number, default: 0 },
      oxygen: { type: Number, default: 0 },
      weight: { type: Number, default: 0 },
    },
    goals: {
      steps: { type: Number, default: 0 },
      water: { type: Number, default: 0 },
      sleep: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Ensure only one log per patient per day
wellnessSchema.index({ patient: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Wellness', wellnessSchema);
