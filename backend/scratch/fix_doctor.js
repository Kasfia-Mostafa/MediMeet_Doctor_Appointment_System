const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Doctor = require('../models/Doctor');

const fixDoctorProfile = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const user = await User.findOne({ email: 'farzana.skin@example.com' });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }
    
    const existingProfile = await Doctor.findOne({ user: user._id });
    if (existingProfile) {
      console.log('Profile already exists');
      process.exit();
    }
    
    await Doctor.create({
      user: user._id,
      specialization: 'Dermatology',
      qualification: 'MBBS, MD (Dermatology)',
      experience: 12,
      consultationFee: 1000,
      bio: 'Expert in clinical and aesthetic dermatology with 12 years of experience.',
      isAvailable: true
    });
    
    console.log('Successfully created doctor profile for Dr. Farzana Choudhury');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixDoctorProfile();
