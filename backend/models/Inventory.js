const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['medicine', 'equipment', 'supplies', 'other'],
      required: true,
    },
    sku: { type: String, unique: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'pcs' },
    unitPrice: { type: Number, required: true },
    reorderLevel: { type: Number, default: 10 },
    supplier: { type: String, default: '' },
    expiryDate: { type: Date },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
    status: { type: String, enum: ['in-stock', 'low-stock', 'out-of-stock'], default: 'in-stock' },
  },
  { timestamps: true }
);

inventorySchema.pre('save', function (next) {
  if (this.quantity === 0) this.status = 'out-of-stock';
  else if (this.quantity <= this.reorderLevel) this.status = 'low-stock';
  else this.status = 'in-stock';
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
