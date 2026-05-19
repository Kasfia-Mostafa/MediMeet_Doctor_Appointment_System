/**
 * ============================================================
 * Auth Routes — /api/auth
 * ============================================================
 * Defines authentication endpoints for user registration,
 * login, logout, token refresh, and fetching the current user.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { register, login, logout, refresh, getMe } = require('../controllers/authController');
const protect = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/register', register);   // POST /api/auth/register — Create new account
router.post('/login', login);         // POST /api/auth/login    — Authenticate and get tokens
router.post('/logout', logout);       // POST /api/auth/logout   — Clear refresh token
router.post('/refresh', refresh);     // POST /api/auth/refresh  — Get new access token

// Protected route (requires valid access token)
router.get('/me', protect, getMe);    // GET  /api/auth/me       — Get current user profile

module.exports = router;
