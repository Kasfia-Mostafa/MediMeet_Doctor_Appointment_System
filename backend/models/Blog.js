/**
 * ============================================================
 * Blog Model — Mongoose Schema
 * ============================================================
 * 
 * Represents a medical article/blog post. Articles can be
 * created by admins and published to the public blog page.
 * Supports categorization, tagging, and cover images.
 * 
 * Key relationships:
 *  - author → User model (the admin who created the post)
 * ============================================================
 */

const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    // ── Content Fields ─────────────────────────────────────
    title: { type: String, required: true },              // Article title
    slug: { type: String, required: true, unique: true }, // URL-friendly slug for routing
    content: { type: String, required: true },            // Full article body (HTML/text)
    excerpt: { type: String, required: true },            // Short summary for previews/cards

    // ── Cover Image (Cloudinary) ───────────────────────────
    coverImage: { type: String, default: '' },            // Cloudinary URL for the cover image
    coverImagePublicId: { type: String, default: '' },    // Cloudinary public ID for deletion

    // ── Author Information ─────────────────────────────────
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, default: '' },            // Cached author display name

    // ── Categorization ─────────────────────────────────────
    category: {
      type: String,
      enum: ['wellness', 'nutrition', 'mental-health', 'fitness', 'medical-tips', 'news', 'other'],
      default: 'other',
    },
    tags: [{ type: String }],                             // Searchable tags for the article

    // ── Publishing & Metrics ───────────────────────────────
    isPublished: { type: Boolean, default: false },       // Draft vs. published flag
    views: { type: Number, default: 0 },                  // View count tracker
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

module.exports = mongoose.model('Blog', blogSchema);
