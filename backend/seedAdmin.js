const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.admin;
    const adminPassword = process.env.admin_password;

    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials missing in .env');
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.name = 'Admin';
      await existingAdmin.save();
      console.log('Admin user updated with name: Admin');
    } else {
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        phone: '01700000000'
      });
      console.log('Admin user created with name: Admin');
    }

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
