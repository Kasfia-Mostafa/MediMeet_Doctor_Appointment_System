/**
 * ============================================================
 * User Controller — Profile & Family Management
 * ============================================================
 * Handles user profile operations: viewing, updating profile
 * info (including avatar upload), changing passwords, and
 * managing family members (add, list, remove).
 * ============================================================
 */

const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

/**
 * @desc    Get the authenticated user's full profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile (name, email, phone, address, avatar, etc.)
 * @route   PUT /api/users/profile
 * @access  Private
 *
 * Supports multipart/form-data for avatar image upload.
 * If a new avatar is uploaded, the old one is deleted from Cloudinary.
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, email, phone, dateOfBirth, gender, bloodGroup, address, emergencyContact } = req.body;

    // Check for email uniqueness if the email is being changed
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email already in use by another account');
      }
      user.email = email;
    }

    // Update fields only if provided in the request
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (address) user.address = { ...user.address, ...address };
    if (emergencyContact) user.emergencyContact = { ...user.emergencyContact, ...emergencyContact };

    // Handle avatar upload — delete old image from Cloudinary if replacing
    if (req.file) {
      if (user.avatarPublicId) {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      }
      user.avatar = req.file.path;
      user.avatarPublicId = req.file.filename;
    }

    const updated = await user.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change the user's password
 * @route   PUT /api/users/password
 * @access  Private
 *
 * Requires the current password for verification before
 * allowing the new password to be set.
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Verify the current password before allowing change
    if (!(await user.comparePassword(currentPassword))) {
      res.status(400);
      throw new Error('Current password is incorrect');
    }

    // Set new password (will be hashed by the pre-save hook)
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all family members for the authenticated user
 * @route   GET /api/users/family
 * @access  Private
 */
const getFamily = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.familyMembers);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new family member to the user's profile
 * @route   POST /api/users/family
 * @access  Private
 */
const addFamily = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.familyMembers.push(req.body);
    await user.save();
    res.status(201).json(user.familyMembers);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a family member by their subdocument ID
 * @route   DELETE /api/users/family/:id
 * @access  Private
 */
const removeFamily = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.familyMembers = user.familyMembers.filter((m) => m._id.toString() !== req.params.id);
    await user.save();
    res.json(user.familyMembers);
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, changePassword, getFamily, addFamily, removeFamily };
