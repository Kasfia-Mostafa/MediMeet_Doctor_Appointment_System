const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialization: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: Number, default: 0 },
    consultationFee: { type: Number, required: true },
    bio: { type: String, default: '' },
    languages: [{ type: String }],
    hospital: { type: String, default: '' },
    location: { type: String, default: '' },
    department: { type: String, default: '' },
    availableDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
    timeSlots: [
      {
        day: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        maxPatients: { type: Number, default: 10 },
      },
    ],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalPatients: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

doctorSchema.index({ specialization: 'text' });

module.exports = mongoose.model('Doctor', doctorSchema);
