/**
 * ============================================================
 * Admin Controller — Dashboard, Staff, Inventory & Blog Mgmt
 * ============================================================
 * Handles all admin-panel operations:
 *  - Dashboard statistics (users, doctors, revenue, etc.)
 *  - Staff/doctor management (CRUD)
 *  - User management and role assignment
 *  - Inventory management
 *  - Analytics (monthly appointments, revenue, top doctors)
 *  - Blog/article management (CRUD)
 * 
 * All routes require admin authentication via protect + roleAuth('admin').
 * ============================================================
 */

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
const Inventory = require('../models/Inventory');
const Contact = require('../models/Contact');
const Blog = require('../models/Blog');

// ════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin only)
 *
 * Fetches counts, revenue, recent users, appointment status
 * breakdown, and specialization distribution in parallel.
 */
const getDashboard = async (req, res, next) => {
  try {
    // Execute all aggregation queries in parallel for performance
    const [users, doctors, appointments, totalRevenue, recentUsers, byStatus, bySpec] = await Promise.all([
      User.countDocuments({ role: 'patient' }).catch(() => 0),
      User.countDocuments({ role: 'doctor' }).catch(() => 0),
      Appointment.countDocuments().catch(() => 0),
      Billing.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$netAmount' } } }]).catch(() => []),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role avatar').catch(() => []),
      Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).catch(() => []),
      Doctor.aggregate([
        { $group: { _id: '$specialization', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).catch(() => [])
    ]);

    const revenue = (totalRevenue && totalRevenue.length > 0) ? totalRevenue[0].total : 0;

    res.json({
      users,          // Total patient count
      doctors,        // Total doctor count
      appointments,   // Total appointment count
      revenue,        // Total paid revenue
      recentUsers,    // 5 most recently registered users
      byStatus,       // Appointment count grouped by status
      bySpec          // Doctor count grouped by specialization
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error while fetching dashboard stats', error: error.message });
  }
};

// ════════════════════════════════════════════════════════════
//  STAFF / DOCTOR MANAGEMENT
// ════════════════════════════════════════════════════════════

/**
 * @desc    Get all staff/doctors (paginated with search)
 * @route   GET /api/admin/staff
 * @access  Private (Admin only)
 */
const getStaff = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search query across user name, email, and specialization
    let doctorQuery = {};
    if (search) {
      const userIds = await User.find({
        $or: [
          { name: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') }
        ],
        role: 'doctor'
      }).select('_id');
      const ids = userIds.map(u => u._id);

      doctorQuery = {
        $or: [
          { user: { $in: ids } },
          { specialization: new RegExp(search, 'i') }
        ]
      };
    }

    const doctors = await Doctor.find(doctorQuery)
      .populate('user', 'name email avatar phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Doctor.countDocuments(doctorQuery);

    res.json({
      doctors,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) { next(error); }
};

/**
 * @desc    Add a new staff member (with optional avatar upload)
 * @route   POST /api/admin/staff
 * @access  Private (Admin only)
 *
 * Creates a User document and, if the role is 'doctor',
 * also creates a Doctor profile with schedule configuration.
 */
const addStaff = async (req, res, next) => {
  try {
    const {
      name, email, password, role, phone,
      specialization, qualification, consultationFee, experience,
      hospital, location, isAvailable
    } = req.body;

    // Handle avatar upload from Cloudinary
    let avatarUrl = '';
    let avatarPublicId = '';
    if (req.file) {
      avatarUrl = req.file.path;
      avatarPublicId = req.file.filename;
    }

    // Create the user account
    const user = await User.create({ name, email, password, role, phone, avatar: avatarUrl, avatarPublicId });

    // If the role is doctor, create the associated Doctor profile
    if (role === 'doctor' && specialization) {
      // Parse time slots (may come as JSON string from form data)
      let slots = [];
      if (req.body.timeSlots) {
        try {
          slots = typeof req.body.timeSlots === 'string' ? JSON.parse(req.body.timeSlots) : req.body.timeSlots;
        } catch (e) { slots = []; }
      }

      // Parse available days
      let days = [];
      if (req.body.availableDays) {
        try {
          days = typeof req.body.availableDays === 'string' ? JSON.parse(req.body.availableDays) : req.body.availableDays;
        } catch (e) { days = []; }
      }

      await Doctor.create({
        user: user._id,
        specialization,
        qualification: qualification || '',
        consultationFee: Number(consultationFee) || 500,
        experience: Number(experience) || 0,
        hospital: hospital || '',
        location: location || '',
        isAvailable: isAvailable === 'true' || isAvailable === true,
        timeSlots: slots,
        availableDays: days
      });
    }
    res.status(201).json(user);
  } catch (error) { next(error); }
};

/**
 * @desc    Get a single staff member's details (by User ID or Doctor ID)
 * @route   GET /api/admin/staff/:id
 * @access  Private (Admin only)
 *
 * Tries User ID first, then Doctor document ID. Creates a
 * placeholder Doctor profile if one doesn't exist for a doctor-role user.
 */
const getStaffMember = async (req, res, next) => {
  try {
    const { id } = req.params;

    // First, try to find by User ID
    let doctor = await Doctor.findOne({ user: id }).populate('user', '-password');

    // If not found by User ID, try by Doctor document ID
    if (!doctor) {
      doctor = await Doctor.findById(id).populate('user', '-password');
    }

    if (!doctor) {
      // Check if it's a non-doctor user (staff/admin)
      const user = await User.findById(id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'Staff/User not found with provided ID' });
      }

      // Auto-create a Doctor profile if the user has doctor role but no profile
      if (user.role === 'doctor') {
        doctor = await Doctor.create({
          user: user._id,
          specialization: 'Not Specified',
          qualification: 'Not Specified',
          experience: 0,
          consultationFee: 0,
          isAvailable: true
        });
        doctor = await Doctor.findById(doctor._id).populate('user', '-password');
      } else {
        return res.json({ user, role: user.role });
      }
    }

    res.json(doctor);
  } catch (error) {
    console.error('getStaffMember Error:', error);
    res.status(500).json({ message: 'Error retrieving staff details', error: error.message });
  }
};

/**
 * @desc    Update a staff member's profile and doctor info
 * @route   PUT /api/admin/staff/:id
 * @access  Private (Admin only)
 */
const updateStaff = async (req, res, next) => {
  try {
    const {
      name, email, phone, role, password,
      specialization, qualification, consultationFee, experience,
      hospital, location, isAvailable
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('Staff not found'); }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone !== undefined ? phone : user.phone;
    user.role = role || user.role;

    // Update password only if explicitly provided
    if (password) {
      user.password = password;
    }

    // Update avatar if new file uploaded
    if (req.file) {
      user.avatar = req.file.path;
      user.avatarPublicId = req.file.filename;
    }

    await user.save();

    // Update the Doctor profile if user is a doctor
    if (user.role === 'doctor') {
      let slots = [];
      if (req.body.timeSlots) {
        try {
          slots = typeof req.body.timeSlots === 'string' ? JSON.parse(req.body.timeSlots) : req.body.timeSlots;
        } catch (e) { slots = []; }
      }

      let days = [];
      if (req.body.availableDays) {
        try {
          days = typeof req.body.availableDays === 'string' ? JSON.parse(req.body.availableDays) : req.body.availableDays;
        } catch (e) { days = []; }
      }

      const updateData = {
        specialization,
        qualification,
        consultationFee: Number(consultationFee),
        experience: Number(experience),
        hospital,
        location,
        isAvailable: isAvailable === 'true' || isAvailable === true,
      };

      if (req.body.timeSlots) {
        updateData.timeSlots = slots;
      }

      if (req.body.availableDays) {
        updateData.availableDays = days;
      }

      // Upsert: create Doctor profile if it doesn't exist yet
      await Doctor.findOneAndUpdate(
        { user: user._id },
        updateData,
        { upsert: true, new: true }
      );
    }

    // Return the populated doctor profile or plain user
    if (user.role === 'doctor') {
      const updatedDoctor = await Doctor.findOne({ user: user._id }).populate('user', '-password');
      res.json(updatedDoctor);
    } else {
      res.json(user);
    }
  } catch (error) { next(error); }
};

/**
 * @desc    Delete a staff member (and their Doctor profile if exists)
 * @route   DELETE /api/admin/staff/:id
 * @access  Private (Admin only)
 */
const deleteStaff = async (req, res, next) => {
  try {
    const userId = req.params.id;
    // Remove the Doctor record first (if it exists)
    await Doctor.findOneAndDelete({ user: userId });
    // Then remove the User record
    const user = await User.findByIdAndDelete(userId);

    if (!user) { res.status(404); throw new Error('Staff not found'); }
    res.json({ message: 'Staff removed successfully' });
  } catch (error) { next(error); }
};

// ════════════════════════════════════════════════════════════
//  INVENTORY MANAGEMENT
// ════════════════════════════════════════════════════════════

/**
 * @desc    Get all inventory items (sorted alphabetically)
 * @route   GET /api/admin/inventory
 * @access  Private (Admin only)
 */
const getInventory = async (req, res, next) => {
  try { const items = await Inventory.find().sort({ name: 1 }); res.json(items); }
  catch (error) { next(error); }
};

/**
 * @desc    Add a new inventory item (auto-generates SKU if not provided)
 * @route   POST /api/admin/inventory
 * @access  Private (Admin only)
 */
const addInventory = async (req, res, next) => {
  try {
    if (!req.body.sku) req.body.sku = 'SKU-' + Date.now();
    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (error) { next(error); }
};

/**
 * @desc    Update an inventory item
 * @route   PUT /api/admin/inventory/:id
 * @access  Private (Admin only)
 */
const updateInventory = async (req, res, next) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) { res.status(404); throw new Error('Item not found'); }
    res.json(item);
  } catch (error) { next(error); }
};

// ════════════════════════════════════════════════════════════
//  ANALYTICS
// ════════════════════════════════════════════════════════════

/**
 * @desc    Get analytics data (monthly trends, revenue, top doctors)
 * @route   GET /api/admin/analytics
 * @access  Private (Admin only)
 */
const getAnalytics = async (req, res, next) => {
  try {
    // Monthly appointment counts
    const monthlyAppointments = await Appointment.aggregate([
      { $group: { _id: { $month: '$date' }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }
    ]);
    // Appointment status breakdown
    const statusBreakdown = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    // Monthly revenue from paid bills
    const monthlyRevenue = await Billing.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$netAmount' } } },
      { $sort: { _id: 1 } }
    ]);
    // Top 10 doctors by completed appointments
    const topDoctors = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$doctor', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'doctor' } },
      { $unwind: '$doctor' },
      { $project: { name: '$doctor.name', avatar: '$doctor.avatar', count: 1 } }
    ]);
    res.json({ monthlyAppointments, statusBreakdown, monthlyRevenue, topDoctors });
  } catch (error) { next(error); }
};

// ════════════════════════════════════════════════════════════
//  USER MANAGEMENT
// ════════════════════════════════════════════════════════════

/**
 * @desc    Get all users (paginated with search and role filter)
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', role = 'all' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    // Search by name or email
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    // Filter by role
    if (role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({ users, total, totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

/**
 * @desc    Update a user's role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin only)
 *
 * If the role is changed away from 'doctor', the Doctor
 * profile document is deleted.
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found'); }

    user.role = role;
    await user.save();

    // Clean up Doctor profile if role is no longer 'doctor'
    if (role !== 'doctor') {
      await Doctor.findOneAndDelete({ user: user._id });
    }

    res.json(user);
  } catch (error) { next(error); }
};

// ════════════════════════════════════════════════════════════
//  BLOG / ARTICLE MANAGEMENT
// ════════════════════════════════════════════════════════════

/**
 * @desc    Get all blog posts (for admin panel, includes drafts)
 * @route   GET /api/admin/blogs
 * @access  Private (Admin only)
 */
const getBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 6 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const blogs = await Blog.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments();

    res.json({
      blogs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) { next(error); }
};

/**
 * @desc    Create a new blog post (with optional cover image)
 * @route   POST /api/admin/blogs
 * @access  Private (Admin only)
 */
const createBlog = async (req, res, next) => {
  try {
    const { title, content, excerpt, category, isPublished, authorName } = req.body;
    // Generate URL-friendly slug from the title
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now();

    const blog = await Blog.create({
      title,
      slug,
      content,
      excerpt,
      category,
      isPublished,
      author: req.user._id,
      authorName: authorName || '',
      coverImage: req.file ? req.file.path : ''
    });

    res.status(201).json(blog);
  } catch (error) { next(error); }
};

/**
 * @desc    Delete a blog post
 * @route   DELETE /api/admin/blogs/:id
 * @access  Private (Admin only)
 */
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) { res.status(404); throw new Error('Blog not found'); }
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) { next(error); }
};

/**
 * @desc    Update an existing blog post
 * @route   PUT /api/admin/blogs/:id
 * @access  Private (Admin only)
 */
const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) { res.status(404); throw new Error('Blog not found'); }

    const { title, content, excerpt, category, isPublished, authorName } = req.body;

    // Regenerate slug if title changes
    if (title) {
      blog.title = title;
      blog.slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now();
    }
    if (content) blog.content = content;
    if (excerpt) blog.excerpt = excerpt;
    if (category) blog.category = category;
    if (isPublished !== undefined) blog.isPublished = isPublished === 'true' || isPublished === true;
    if (authorName !== undefined) blog.authorName = authorName;

    // Update cover image if new file uploaded
    if (req.file) {
      blog.coverImage = req.file.path;
    }

    await blog.save();
    res.json(blog);
  } catch (error) { next(error); }
};

module.exports = {
  getDashboard,
  getStaff,
  addStaff,
  updateStaff,
  deleteStaff,
  getInventory,
  addInventory,
  updateInventory,
  getAnalytics,
  getUsers,
  updateUserRole,
  getBlogs,
  createBlog,
  deleteBlog,
  updateBlog,
  getStaffMember
};
