const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
require('dotenv').config();

async function updateLocations() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const doctorsData = JSON.parse(fs.readFileSync('./doctors.json', 'utf8'));

    for (const d of doctorsData) {
      const user = await User.findOne({ email: d.email });
      if (user) {
        const doctor = await Doctor.findOne({ user: user._id });
        if (doctor) {
          doctor.location = d.location;
          doctor.hospital = d.hospital; // might as well update hospital just in case
          await doctor.save();
          console.log(`Updated location for: ${d.name}`);
        } else {
            console.log(`Doctor profile not found for user: ${d.name}`);
        }
      } else {
        console.log(`User not found: ${d.name}`);
      }
    }

    console.log('Locations updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating data:', error);
    process.exit(1);
  }
}

updateLocations();
