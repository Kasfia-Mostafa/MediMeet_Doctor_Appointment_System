const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    type: { type: String, enum: ['in-person', 'video', 'phone'], default: 'in-person' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'pending',
    },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    transactionId: { type: String, default: '' },
    reason: { type: String, required: true },
    symptoms: [{ type: String }],
    notes: { type: String, default: '' },
    prescription: { type: String, default: '' },
    followUp: { type: Date },
    cancelReason: { type: String, default: '' },
    familyMember: { type: String, default: '' },
    patientNotes: { type: String, default: '' },
    medicalFiles: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        originalName: { type: String },
        fileType: { type: String }, // 'image/png', 'application/pdf', etc.
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
