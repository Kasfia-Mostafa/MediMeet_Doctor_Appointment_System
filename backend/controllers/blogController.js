const Blog = require('../models/Blog');

const getBlogs = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 9 } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;
    const blogs = await Blog.find(query).populate('author', 'name avatar').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await Blog.countDocuments(query);
    res.json({ blogs, total, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

const getBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name avatar');
    if (!blog) { res.status(404); throw new Error('Blog post not found'); }
    res.json(blog);
  } catch (error) { next(error); }
};

const createBlog = async (req, res, next) => {
  try {
    const { title, content, excerpt, category, tags, isPublished } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const blog = await Blog.create({
      title, slug, content, excerpt, category, author: req.user._id,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      isPublished: isPublished === 'true' || isPublished === true,
      coverImage: req.file ? req.file.path : '',
      coverImagePublicId: req.file ? req.file.filename : '',
    });
    res.status(201).json(blog);
  } catch (error) { next(error); }
};

const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) { res.status(404); throw new Error('Not found'); }
    Object.keys(req.body).forEach(key => { blog[key] = req.body[key]; });
    if (req.file) { blog.coverImage = req.file.path; blog.coverImagePublicId = req.file.filename; }
    await blog.save();
    res.json(blog);
  } catch (error) { next(error); }
};

const deleteBlog = async (req, res, next) => {
  try { await Blog.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (error) { next(error); }
};

module.exports = { getBlogs, getBlog, createBlog, updateBlog, deleteBlog };
