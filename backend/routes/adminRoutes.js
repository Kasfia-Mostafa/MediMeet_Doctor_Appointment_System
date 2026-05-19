/**
 * ============================================================
 * Admin Routes — /api/admin
 * ============================================================
 * Defines all admin-panel API routes. Every route is protected
 * with authentication and restricted to the 'admin' role.
 * Covers: dashboard stats, user/staff management, inventory,
 * analytics, and blog/article CRUD.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { 
  getDashboard, getStaff, addStaff, updateStaff, deleteStaff, 
  getInventory, addInventory, updateInventory, getAnalytics,
  getUsers, updateUserRole,
  getBlogs, createBlog, deleteBlog, updateBlog,
  getStaffMember
} = require('../controllers/adminController');
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { upload } = require('../config/cloudinary');

// All admin routes require authentication + admin role
router.use(protect, roleAuth('admin'));

// ── Dashboard ──────────────────────────────────────────────
router.get('/dashboard', getDashboard);              // GET /api/admin/dashboard — Dashboard stats
router.get('/stats', getDashboard);                  // GET /api/admin/stats     — Alias for dashboard

// ── User Management ────────────────────────────────────────
router.get('/users', getUsers);                      // GET    /api/admin/users         — List all users
router.put('/users/:id/role', updateUserRole);       // PUT    /api/admin/users/:id/role — Change user role
router.delete('/users/:id', deleteStaff);            // DELETE /api/admin/users/:id      — Delete user

// ── Staff/Doctor Management ────────────────────────────────
router.get('/staff', getStaff);                                    // GET    /api/admin/staff      — List doctors
router.get('/staff/:id', getStaffMember);                          // GET    /api/admin/staff/:id  — Doctor details
router.post('/staff', upload.single('avatar'), addStaff);          // POST   /api/admin/staff      — Add new doctor
router.put('/staff/:id', upload.single('avatar'), updateStaff);    // PUT    /api/admin/staff/:id  — Update doctor
router.delete('/staff/:id', deleteStaff);                          // DELETE /api/admin/staff/:id  — Remove doctor

// ── Inventory Management ───────────────────────────────────
router.get('/inventory', getInventory);              // GET  /api/admin/inventory      — List inventory
router.post('/inventory', addInventory);             // POST /api/admin/inventory      — Add item
router.put('/inventory/:id', updateInventory);       // PUT  /api/admin/inventory/:id  — Update item

// ── Analytics ──────────────────────────────────────────────
router.get('/analytics', getAnalytics);              // GET /api/admin/analytics — Charts & metrics data

// ── Blog Management ────────────────────────────────────────
router.get('/blogs', getBlogs);                                        // GET    /api/admin/blogs      — List articles
router.post('/blogs', upload.single('coverImage'), createBlog);        // POST   /api/admin/blogs      — Create article
router.put('/blogs/:id', upload.single('coverImage'), updateBlog);     // PUT    /api/admin/blogs/:id  — Update article
router.delete('/blogs/:id', deleteBlog);                               // DELETE /api/admin/blogs/:id  — Delete article

module.exports = router;
