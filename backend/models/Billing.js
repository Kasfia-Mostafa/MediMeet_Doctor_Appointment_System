/**
 * ============================================================
 * Billing Model — Mongoose Schema
 * ============================================================
 * 
 * Represents an invoice/bill generated for a patient's
 * appointment. Each billing record contains line items,
 * totals, and payment tracking information.
 * 
 * Key relationships:
 *  - patient     → User model
 *  - appointment → Appointment model
 * 
 * Invoice numbers are auto-generated in a pre-save hook
 * with the format: "INV-<timestamp>-<random4>"
 * ============================================================
 */

const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema(
  {
    // ── References ─────────────────────────────────────────
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },

    // ── Line Items ─────────────────────────────────────────
    // Array of individual charges (e.g., consultation fee, lab fees)
    items: [
      {
        description: { type: String, required: true },   // Item description
        amount: { type: Number, required: true },        // Unit price
        quantity: { type: Number, default: 1 },          // Quantity of this item
      },
    ],

    // ── Financial Totals ───────────────────────────────────
    totalAmount: { type: Number, required: true },       // Sum of all items (before discount/tax)
    discount: { type: Number, default: 0 },              // Discount amount
    tax: { type: Number, default: 0 },                   // Tax amount
    netAmount: { type: Number, required: true },         // Final amount after discount and tax

    // ── Payment Status & Method ────────────────────────────
    status: { type: String, enum: ['pending', 'paid', 'overdue', 'cancelled'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cash', 'card', 'bkash', 'nagad', 'insurance', ''], default: '' },
    paidAt: { type: Date },                              // Date when payment was received
    dueDate: { type: Date },                             // Payment due date

    // ── Invoice Identifier ─────────────────────────────────
    invoiceNumber: { type: String, unique: true },       // Auto-generated unique invoice number
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

/**
 * Pre-save hook: Auto-generates a unique invoice number
 * if one hasn't been assigned yet.
 * Format: "INV-<timestamp>-<4-char-random-alphanumeric>"
 */
billingSchema.pre('save', function (next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = 'INV-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Billing', billingSchema);
