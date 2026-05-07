const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, email, phone, dateOfBirth, gender, bloodGroup, address, emergencyContact } = req.body;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email already in use by another account');
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (address) user.address = { ...user.address, ...address };
    if (emergencyContact) user.emergencyContact = { ...user.emergencyContact, ...emergencyContact };

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

// @desc    Change password
// @route   PUT /api/users/password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.comparePassword(currentPassword))) {
      res.status(400);
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get family members
// @route   GET /api/users/family
const getFamily = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.familyMembers);
  } catch (error) {
    next(error);
  }
};

// @desc    Add family member
// @route   POST /api/users/family
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

// @desc    Remove family member
// @route   DELETE /api/users/family/:id
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
