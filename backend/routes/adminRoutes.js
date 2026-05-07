const express = require('express');
const router = express.Router();
const { 
  getDashboard, getStaff, addStaff, updateStaff, deleteStaff, 
  getInventory, addInventory, updateInventory, getAnalytics,
  getUsers, updateUserRole,
  getBlogs, createBlog, deleteBlog
} = require('../controllers/adminController');
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { upload } = require('../config/cloudinary');

router.use(protect, roleAuth('admin'));
router.get('/dashboard', getDashboard);
router.get('/stats', getDashboard);

// User Management
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteStaff); // Reuse deleteStaff logic

// Staff/Doctor Management
router.get('/staff', getStaff);
router.post('/staff', upload.single('avatar'), addStaff);
router.put('/staff/:id', upload.single('avatar'), updateStaff);
router.delete('/staff/:id', deleteStaff);

router.get('/inventory', getInventory);
router.post('/inventory', addInventory);
router.put('/inventory/:id', updateInventory);
router.get('/analytics', getAnalytics);

// Blog Management
router.get('/blogs', getBlogs);
router.post('/blogs', upload.single('coverImage'), createBlog);
router.delete('/blogs/:id', deleteBlog);

module.exports = router;
