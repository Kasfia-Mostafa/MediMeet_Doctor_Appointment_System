/**
 * ============================================================
 * User Routes — /api/users
 * ============================================================
 * Defines routes for user profile management and family
 * member operations. All routes are protected (require auth).
 * Avatar uploads use Cloudinary via multer middleware.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, getFamily, addFamily, removeFamily } = require('../controllers/userController');
const protect = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// All routes require authentication
router.use(protect);

// Profile management
router.get('/profile', getProfile);                          // GET    /api/users/profile  — Fetch user profile
router.put('/profile', upload.single('avatar'), updateProfile); // PUT    /api/users/profile  — Update profile (with avatar)
router.put('/password', changePassword);                     // PUT    /api/users/password — Change password

// Family member management
router.get('/family', getFamily);                            // GET    /api/users/family      — List family members
router.post('/family', addFamily);                           // POST   /api/users/family      — Add family member
router.delete('/family/:id', removeFamily);                  // DELETE /api/users/family/:id  — Remove family member

module.exports = router;
