const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Doctor = require('../models/Doctor');

const findMissingDoctor = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const doctorUsers = await User.find({ role: 'doctor' }).select('_id email name');
    const doctorProfiles = await Doctor.find().select('user');
    
    const profileUserIds = doctorProfiles.map(p => p.user.toString());
    
    const missing = doctorUsers.filter(u => !profileUserIds.includes(u._id.toString()));
    
    console.log('--- MISSING DOCTOR PROFILES ---');
    console.log('Total Doctor Users:', doctorUsers.length);
    console.log('Total Doctor Profiles:', doctorProfiles.length);
    
    if (missing.length > 0) {
      console.log('Users with role "doctor" but no profile:');
      missing.forEach(u => console.log(`- ${u.name} (${u.email}) [ID: ${u._id}]`));
    } else {
      console.log('No missing profiles found.');
    }
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

findMissingDoctor();
