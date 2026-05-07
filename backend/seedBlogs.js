const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Blog = require('./models/Blog');
const connectDB = require('./config/db');

dotenv.config();

const seedBlogs = async () => {
  try {
    await connectDB();

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin user found.');
      process.exit(1);
    }

    const blogs = [
      {
        title: 'Welcome to Stitch ID',
        slug: 'welcome-to-stitch-id',
        content: 'This is your first blog post.',
        excerpt: 'Welcome to our medical portal.',
        author: admin._id,
        category: 'news',
        isPublished: true
      }
    ];

    await Blog.deleteMany({});
    await Blog.insertMany(blogs);

    console.log('Blogs seeded.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedBlogs();
