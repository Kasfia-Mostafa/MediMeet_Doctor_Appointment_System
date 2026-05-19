/**
 * ============================================================
 * Blog Routes — /api/blogs
 * ============================================================
 * Defines public and admin blog endpoints. Public users can
 * read published articles. Admin users can create, update,
 * and delete articles with optional cover image uploads.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { getBlogs, getBlog, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { upload } = require('../config/cloudinary');

// ── Public Routes ──────────────────────────────────────────
router.get('/', getBlogs);                                                          // GET /api/blogs     — List published articles
router.get('/:id', getBlog);                                                        // GET /api/blogs/:id — Read single article

// ── Admin Routes (Protected) ───────────────────────────────
router.post('/', protect, roleAuth('admin'), upload.single('coverImage'), createBlog);     // POST   — Create article
router.put('/:id', protect, roleAuth('admin'), upload.single('coverImage'), updateBlog);   // PUT    — Update article
router.delete('/:id', protect, roleAuth('admin'), deleteBlog);                             // DELETE — Delete article

module.exports = router;
