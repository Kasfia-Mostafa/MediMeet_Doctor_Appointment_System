const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const admin = await User.findOne({ email: 'kasfiamostafa03@gmail.com' });
    if (admin) {
      console.log('Admin User Found:');
      console.log('Name:', admin.name);
      console.log('Role:', admin.role);
    } else {
      console.log('Admin User NOT FOUND in database');
    }
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkAdmin();
