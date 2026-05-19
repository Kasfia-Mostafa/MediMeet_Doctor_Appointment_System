/**
 * ============================================================
 * Auth Controller — Registration, Login, Logout, Token Refresh
 * ============================================================
 * Handles all authentication-related operations including user
 * registration, login with JWT issuance, logout with cookie
 * clearing, token refresh rotation, and fetching the current
 * authenticated user's profile.
 * ============================================================
 */

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

/**
 * @desc    Register a new user (patient or doctor)
 * @route   POST /api/auth/register
 * @access  Public
 *
 * If the role is 'doctor', a Doctor profile document is also
 * created. If doctor profile creation fails, the user is
 * rolled back (deleted) to maintain data consistency.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, specialization, qualification, consultationFee } = req.body;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    // Create the user document
    const user = await User.create({ name, email, password, role: role || 'patient', phone });

    // If registering as a doctor, create the associated Doctor profile
    if (role === 'doctor') {
      try {
        await Doctor.create({
          user: user._id,
          specialization: specialization || 'General Medicine',
          qualification: qualification || 'MBBS',
          consultationFee: consultationFee || 500,
        });
      } catch (docError) {
        // Rollback: delete the user if doctor profile creation fails
        await User.findByIdAndDelete(user._id);
        res.status(400);
        throw new Error(`Doctor profile creation failed: ${docError.message}`);
      }
    }

    // Generate JWT tokens (access + refresh)
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in the user document for validation
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as HTTP-only cookie (7-day expiry)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    res.status(201).json({
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user and issue JWT tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email and verify password
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Check if the account is active
    if (!user.isActive) {
      res.status(403);
      throw new Error('Account is deactivated. Contact admin.');
    }

    // Generate new token pair
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token and set cookie
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user, accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user — clear refresh token from DB and cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    // If a refresh token cookie exists, invalidate it in the database
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = '';
        await user.save();
      }
    }

    // Clear the cookie from the browser
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token using the refresh token cookie
 * @route   POST /api/auth/refresh
 * @access  Public (requires valid refresh token cookie)
 *
 * Implements token rotation: a new refresh token is issued
 * each time, and the old one is invalidated.
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      res.status(401);
      throw new Error('No refresh token');
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    // Validate that the stored refresh token matches (prevents reuse)
    if (!user || user.refreshToken !== refreshToken) {
      res.status(401);
      throw new Error('Invalid refresh token');
    }

    // Generate new token pair (token rotation)
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update stored refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get the currently authenticated user's profile
 * @route   GET /api/auth/me
 * @access  Private (requires valid access token)
 *
 * Also returns the doctor profile if the user is a doctor.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let doctorProfile = null;

    // If user is a doctor, fetch their Doctor profile document
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }

    res.json({ user, doctorProfile });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, refresh, getMe };
