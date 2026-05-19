/**
 * ============================================================
 * JWT Token Generation Utility
 * ============================================================
 * Generates short-lived access tokens and long-lived refresh
 * tokens for the authentication system. Access tokens are used
 * in API requests; refresh tokens are stored in HTTP-only
 * cookies for silent token renewal.
 * ============================================================
 */

const jwt = require('jsonwebtoken');

/**
 * Generates a short-lived JWT access token.
 * @param {string} userId - The MongoDB user ID to encode
 * @returns {string} Signed JWT access token
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m', // Default: 15 minutes
  });
};

/**
 * Generates a long-lived JWT refresh token.
 * @param {string} userId - The MongoDB user ID to encode
 * @returns {string} Signed JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d', // Default: 7 days
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
