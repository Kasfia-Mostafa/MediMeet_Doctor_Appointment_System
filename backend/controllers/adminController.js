const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
const Inventory = require('../models/Inventory');
const Contact = require('../models/Contact');
const Blog = require('../models/Blog');

const getDashboard = async (req, res, next) => {
  try {
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
      users, 
      doctors, 
      appointments, 
      revenue, 
      recentUsers,
      byStatus,
      bySpec
    });
  } catch (error) { 
    res.status(500).json({ message: 'Internal server error while fetching dashboard stats', error: error.message });
  }
};

const getStaff = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

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

const addStaff = async (req, res, next) => {
  try {
    const { 
      name, email, password, role, phone, 
      specialization, qualification, consultationFee, experience, 
      hospital, location, isAvailable 
    } = req.body;
    
    let avatarUrl = '';
    let avatarPublicId = '';
    if (req.file) {
      avatarUrl = req.file.path;
      avatarPublicId = req.file.filename;
    }

    const user = await User.create({ name, email, password, role, phone, avatar: avatarUrl, avatarPublicId });
    if (role === 'doctor' && specialization) {
      await Doctor.create({ 
        user: user._id, 
        specialization, 
        qualification: qualification || '', 
        consultationFee: Number(consultationFee) || 500, 
        experience: Number(experience) || 0,
        hospital: hospital || '',
        location: location || '',
        isAvailable: isAvailable === 'true' || isAvailable === true
      });
    }
    res.status(201).json(user);
  } catch (error) { next(error); }
};

const updateStaff = async (req, res, next) => {
  try {
    const { 
      name, email, phone, role, password,
      specialization, qualification, consultationFee, experience, 
      hospital, location, isAvailable 
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('Staff not found'); }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone !== undefined ? phone : user.phone;
    user.role = role || user.role;
    
    if (password) {
      user.password = password;
    }

    if (req.file) {
      user.avatar = req.file.path;
      user.avatarPublicId = req.file.filename;
    }

    await user.save();

    if (user.role === 'doctor') {
      await Doctor.findOneAndUpdate(
        { user: user._id },
        { 
          specialization, 
          qualification, 
          consultationFee: Number(consultationFee), 
          experience: Number(experience),
          hospital,
          location,
          isAvailable: isAvailable === 'true' || isAvailable === true
        },
        { upsert: true, new: true }
      );
    }

    res.json(user);
  } catch (error) { next(error); }
};

const deleteStaff = async (req, res, next) => {
  try {
    const userId = req.params.id;
    // Find and remove the doctor record first if it exists
    await Doctor.findOneAndDelete({ user: userId });
    // Remove the user record
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) { res.status(404); throw new Error('Staff not found'); }
    res.json({ message: 'Staff removed successfully' });
  } catch (error) { next(error); }
};

const getInventory = async (req, res, next) => {
  try { const items = await Inventory.find().sort({ name: 1 }); res.json(items); }
  catch (error) { next(error); }
};

const addInventory = async (req, res, next) => {
  try {
    if (!req.body.sku) req.body.sku = 'SKU-' + Date.now();
    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (error) { next(error); }
};

const updateInventory = async (req, res, next) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) { res.status(404); throw new Error('Item not found'); }
    res.json(item);
  } catch (error) { next(error); }
};

const getAnalytics = async (req, res, next) => {
  try {
    const monthlyAppointments = await Appointment.aggregate([
      { $group: { _id: { $month: '$date' }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }
    ]);
    const statusBreakdown = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const monthlyRevenue = await Billing.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$netAmount' } } },
      { $sort: { _id: 1 } }
    ]);
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

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', role = 'all' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
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

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    
    user.role = role;
    await user.save();
    
    // If role is changed FROM doctor TO something else, delete Doctor record
    if (role !== 'doctor') {
      await Doctor.findOneAndDelete({ user: user._id });
    }
    
    res.json(user);
  } catch (error) { next(error); }
};

const getBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find().populate('author', 'name').sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) { next(error); }
};

const createBlog = async (req, res, next) => {
  try {
    const { title, content, excerpt, category, isPublished } = req.body;
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now();
    
    const blog = await Blog.create({
      title,
      slug,
      content,
      excerpt,
      category,
      isPublished,
      author: req.user._id,
      coverImage: req.file ? req.file.path : ''
    });
    
    res.status(201).json(blog);
  } catch (error) { next(error); }
};

const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) { res.status(404); throw new Error('Blog not found'); }
    res.json({ message: 'Blog deleted successfully' });
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
  deleteBlog
};
