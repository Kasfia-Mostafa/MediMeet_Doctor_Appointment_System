const express = require('express');
const router = express.Router();
const { getBlogs, getBlog, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { upload } = require('../config/cloudinary');

router.get('/', getBlogs);
router.get('/:id', getBlog);
router.post('/', protect, roleAuth('admin'), upload.single('coverImage'), createBlog);
router.put('/:id', protect, roleAuth('admin'), upload.single('coverImage'), updateBlog);
router.delete('/:id', protect, roleAuth('admin'), deleteBlog);

module.exports = router;
