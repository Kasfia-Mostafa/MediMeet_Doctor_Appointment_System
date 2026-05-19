/**
 * ============================================================
 * Authentication Middleware — JWT Token Verification
 * ============================================================
 * 
 * Protects routes by verifying the JWT access token from the
 * Authorization header (Bearer scheme). On success, attaches
 * the authenticated user object to `req.user` for downstream
 * route handlers. Also checks that the user account is active.
 * 
 * Usage: router.get('/protected', protect, handler);
 * ============================================================
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Express middleware that validates JWT access tokens.
 * 
 * Flow:
 * 1. Extract token from "Authorization: Bearer <token>" header
 * 2. Verify token signature and expiration using JWT_SECRET
 * 3. Fetch user from database (excluding sensitive fields)
 * 4. Verify user exists and account is active
 * 5. Attach user to req.user and call next()
 * 
 * @param {Object} req  - Express request object
 * @param {Object} res  - Express response object
 * @param {Function} next - Express next middleware function
 */
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // No token provided — deny access
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    // Verify the token and extract the user ID from the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from DB, excluding password and refresh token for security
    req.user = await User.findById(decoded.id).select('-password -refreshToken');

    // Ensure the user still exists in the database
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Ensure the user's account hasn't been deactivated
    if (!req.user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    next(); // Token is valid — proceed to the route handler
  } catch (error) {
    // Handle expired tokens separately so the frontend can trigger a refresh
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', expired: true });
    }
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = protect;
