const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
require('dotenv').config();

const defaultTimeSlots = [
  { day: 'monday', startTime: '09:00', endTime: '13:00', maxPatients: 10 },
  { day: 'monday', startTime: '15:00', endTime: '18:00', maxPatients: 10 },
  { day: 'wednesday', startTime: '09:00', endTime: '13:00', maxPatients: 10 },
  { day: 'wednesday', startTime: '15:00', endTime: '18:00', maxPatients: 10 },
  { day: 'friday', startTime: '09:00', endTime: '13:00', maxPatients: 10 },
  { day: 'friday', startTime: '15:00', endTime: '18:00', maxPatients: 10 },
];
const defaultAvailableDays = ['monday', 'wednesday', 'friday'];

async function addSlots() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Update all doctors that don't have availableDays set (or array is empty)
    const result = await Doctor.updateMany(
      { $or: [ { availableDays: { $size: 0 } }, { availableDays: { $exists: false } } ] },
      { 
        $set: { 
          timeSlots: defaultTimeSlots,
          availableDays: defaultAvailableDays
        } 
      }
    );
    console.log(`Updated ${result.modifiedCount} doctors with default slots.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

addSlots();
