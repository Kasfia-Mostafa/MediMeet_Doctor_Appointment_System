const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    type: {
      type: String,
      enum: ['prescription', 'lab-result', 'diagnosis', 'other'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    diagnosis: { type: String, default: '' },
    medications: [
      {
        name: { type: String },
        dosage: { type: String },
        frequency: { type: String },
        duration: { type: String },
      },
    ],
    vitals: {
      bloodPressure: { type: String, default: '' },
      heartRate: { type: Number },
      temperature: { type: Number },
      weight: { type: Number },
      height: { type: Number },
      oxygenSaturation: { type: Number },
    },
    files: [
      {
        url: { type: String },
        publicId: { type: String },
        name: { type: String },
        type: { type: String },
      },
    ],
    isConfidential: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
