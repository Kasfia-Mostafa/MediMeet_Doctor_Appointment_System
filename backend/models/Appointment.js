/**
 * ============================================================
 * Appointment Model — Mongoose Schema
 * ============================================================
 * 
 * Represents a medical appointment between a patient and a
 * doctor. Tracks scheduling details, appointment status,
 * payment information, and any attached medical files.
 * 
 * Key relationships:
 *  - patient       → User model (the patient)
 *  - doctor        → User model (the doctor's user account)
 *  - doctorProfile → Doctor model (the doctor's profile)
 * 
 * Status lifecycle:
 *  pending → confirmed → in-progress → completed
 *  pending → cancelled
 *  pending/confirmed → no-show (auto-expired by cron job)
 * ============================================================
 */

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    // ── References ─────────────────────────────────────────
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },

    // ── Scheduling Details ─────────────────────────────────
    date: { type: Date, required: true },              // Appointment date (stored in UTC)
    timeSlot: { type: String, required: true },        // Time slot string (e.g., "09:00")
    type: { type: String, enum: ['in-person', 'video', 'phone'], default: 'in-person' },

    // ── Appointment Status ─────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'pending',
    },

    // ── Payment Information ────────────────────────────────
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    transactionId: { type: String, default: '' },      // Stripe transaction/payment intent ID

    // ── Clinical Details ───────────────────────────────────
    reason: { type: String, required: true },          // Reason for visit
    symptoms: [{ type: String }],                      // List of reported symptoms
    notes: { type: String, default: '' },              // Doctor's clinical notes
    prescription: { type: String, default: '' },       // Prescription text
    followUp: { type: Date },                         // Follow-up appointment date

    // ── Cancellation ───────────────────────────────────────
    cancelReason: { type: String, default: '' },       // Reason for cancellation

    // ── Family Booking ─────────────────────────────────────
    familyMember: { type: String, default: '' },       // Name of the family member (if booking for someone else)
    patientNotes: { type: String, default: '' },       // Additional notes from the patient

    // ── Attached Medical Files (Cloudinary) ────────────────
    medicalFiles: [
      {
        url: { type: String, required: true },         // Cloudinary file URL
        publicId: { type: String },                    // Cloudinary public ID for deletion
        originalName: { type: String },                // Original filename from upload
        fileType: { type: String },                    // MIME type (e.g., 'image/png', 'application/pdf')
        uploadedAt: { type: Date, default: Date.now }, // Timestamp of upload
      },
    ],
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

module.exports = mongoose.model('Appointment', appointmentSchema);
