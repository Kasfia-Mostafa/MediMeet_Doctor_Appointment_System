const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    items: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'overdue', 'cancelled'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cash', 'card', 'bkash', 'nagad', 'insurance', ''], default: '' },
    paidAt: { type: Date },
    dueDate: { type: Date },
    invoiceNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

billingSchema.pre('save', function (next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = 'INV-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Billing', billingSchema);
