/**
 * ============================================================
 * User Model — Mongoose Schema
 * ============================================================
 * 
 * Defines the User document schema for MongoDB. Users are the
 * core entity in MediMeet and can have one of three roles:
 *   - patient: Books appointments, manages health records
 *   - doctor:  Manages schedule, treats patients
 *   - admin:   Full system access, manages staff and analytics
 * 
 * Features:
 *  - Password hashing with bcrypt (salt rounds: 12) on save
 *  - Password comparison method for login verification
 *  - Custom toJSON method to strip sensitive fields
 *  - Address and emergency contact sub-documents
 *  - Family members embedded array for dependent management
 *  - Avatar support via Cloudinary (URL + public ID)
 *  - Refresh token storage for JWT token rotation
 * ============================================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ── Core Identity Fields ───────────────────────────────
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
    phone: { type: String, default: '' },

    // ── Profile Image (Cloudinary) ─────────────────────────
    avatar: { type: String, default: '' },          // Cloudinary URL
    avatarPublicId: { type: String, default: '' },  // Cloudinary public ID for deletion

    // ── Medical/Personal Information ───────────────────────
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    bloodGroup: { type: String, default: '' },

    // ── Address Sub-document ───────────────────────────────
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      country: { type: String, default: 'Bangladesh' },
    },

    // ── Emergency Contact Sub-document ─────────────────────
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },

    // ── Family Members (Embedded Array) ────────────────────
    // Allows patients to add dependents who can share the same account
    familyMembers: [
      {
        name: { type: String, required: true },
        relation: { type: String, required: true },
        dateOfBirth: { type: Date },
        bloodGroup: { type: String },
        avatar: { type: String, default: '' },
      },
    ],

    // ── Account Status & Security ──────────────────────────
    isActive: { type: Boolean, default: true },     // Admin can deactivate accounts
    refreshToken: { type: String },                 // Stored refresh token for JWT rotation
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

/**
 * Pre-save hook: Hashes the password before saving to the database.
 * Only runs when the password field has been modified (prevents
 * re-hashing on profile updates that don't change the password).
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance method: Compares a plain-text password with the stored hash.
 * Used during login authentication.
 * 
 * @param {string} candidatePassword - The plain-text password to verify
 * @returns {Promise<boolean>} True if the password matches
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Custom toJSON method: Strips sensitive fields (password, refreshToken)
 * from the user object when it's serialized to JSON (e.g., in API responses).
 * 
 * @returns {Object} Sanitized user object
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  return user;
};

module.exports = mongoose.model('User', userSchema);
