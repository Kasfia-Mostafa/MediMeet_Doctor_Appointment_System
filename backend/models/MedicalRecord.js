/**
 * ============================================================
 * Medical Record Model — Mongoose Schema
 * ============================================================
 * 
 * Stores medical records created by doctors for their patients.
 * Records can include prescriptions, lab results, or other
 * clinical documents. Each record may contain medications,
 * vital signs, and attached files (PDFs, images).
 * 
 * Key relationships:
 *  - patient     → User model (the patient)
 *  - doctor      → User model (the creating doctor)
 *  - appointment → Appointment model (optional link)
 * ============================================================
 */

const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    // ── References ─────────────────────────────────────────
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },

    // ── Record Classification ──────────────────────────────
    type: {
      type: String,
      enum: ['prescription', 'lab-result', 'other'],
      required: true,
    },
    title: { type: String, required: true },               // Record title/heading
    description: { type: String, default: '' },            // Detailed notes or findings

    // ── Medications Prescribed ─────────────────────────────
    // Array of prescribed medications with dosage instructions
    medications: [
      {
        name: { type: String },                            // Medication name
        dosage: { type: String },                          // Dosage (e.g., "500mg")
        frequency: { type: String },                       // How often (e.g., "3 times daily")
        duration: { type: String },                        // Duration (e.g., "7 days")
      },
    ],

    // ── Vital Signs ────────────────────────────────────────
    // Recorded vital measurements from the appointment
    vitals: {
      bloodPressure: { type: String, default: '' },        // e.g., "120/80 mmHg"
      heartRate: { type: Number },                         // Beats per minute
      temperature: { type: Number },                       // Body temperature (°F or °C)
      weight: { type: Number },                            // Weight in kg
      height: { type: Number },                            // Height in cm
      oxygenSaturation: { type: Number },                  // SpO2 percentage
    },

    // ── Attached Files (Cloudinary) ────────────────────────
    // Lab reports, prescriptions, or other document scans
    files: [
      {
        url: { type: String },                             // Cloudinary file URL
        publicId: { type: String },                        // Cloudinary public ID
        name: { type: String },                            // Original filename
        type: { type: String },                            // MIME type
      },
    ],

    // ── Privacy Flag ───────────────────────────────────────
    isConfidential: { type: Boolean, default: false },     // Marks record as sensitive
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
