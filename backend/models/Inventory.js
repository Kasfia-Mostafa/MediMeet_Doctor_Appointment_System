/**
 * ============================================================
 * Inventory Model — Mongoose Schema
 * ============================================================
 * 
 * Represents medical inventory items managed by administrators.
 * Tracks stock levels, pricing, supplier info, and expiry dates
 * for medicines, equipment, and supplies.
 * 
 * Features:
 *  - Auto-generated SKU if not provided
 *  - Pre-save hook automatically updates stock status based
 *    on quantity vs. reorder level thresholds
 * 
 * Status logic:
 *  - quantity === 0             → 'out-of-stock'
 *  - quantity <= reorderLevel   → 'low-stock'
 *  - quantity > reorderLevel    → 'in-stock'
 * ============================================================
 */

const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    // ── Item Identity ──────────────────────────────────────
    name: { type: String, required: true },                // Item display name
    category: {
      type: String,
      enum: ['medicine', 'equipment', 'supplies', 'other'],
      required: true,
    },
    sku: { type: String, unique: true },                   // Stock Keeping Unit (auto-generated if empty)
    description: { type: String, default: '' },            // Item description

    // ── Stock & Pricing ────────────────────────────────────
    quantity: { type: Number, required: true, min: 0 },    // Current stock quantity
    unit: { type: String, default: 'pcs' },                // Unit of measure (pcs, boxes, ml, etc.)
    unitPrice: { type: Number, required: true },           // Price per unit
    reorderLevel: { type: Number, default: 10 },           // Threshold to trigger low-stock alert

    // ── Supply Chain ───────────────────────────────────────
    supplier: { type: String, default: '' },               // Supplier name
    expiryDate: { type: Date },                            // Expiration date (for medicines)
    location: { type: String, default: '' },               // Storage location

    // ── Auto-computed Status ───────────────────────────────
    status: { type: String, enum: ['in-stock', 'low-stock', 'out-of-stock'], default: 'in-stock' },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

/**
 * Pre-save hook: Automatically updates the inventory status
 * based on the current quantity relative to the reorder level.
 */
inventorySchema.pre('save', function (next) {
  if (this.quantity === 0) this.status = 'out-of-stock';
  else if (this.quantity <= this.reorderLevel) this.status = 'low-stock';
  else this.status = 'in-stock';
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
