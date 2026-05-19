/**
 * ============================================================
 * Contact Model — Mongoose Schema
 * ============================================================
 * 
 * Stores messages submitted through the public contact form.
 * Allows visitors (both authenticated and anonymous) to send
 * inquiries to the MediMeet support team.
 * 
 * Status lifecycle: new → read → replied → archived
 * ============================================================
 */

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },                // Sender's full name
    email: { type: String, required: true },               // Sender's email for reply
    phone: { type: String, default: '' },                  // Optional phone number
    subject: { type: String, required: true },             // Message subject line
    message: { type: String, required: true },             // Message body content
    status: { type: String, enum: ['new', 'read', 'replied', 'archived'], default: 'new' },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

module.exports = mongoose.model('Contact', contactSchema);
