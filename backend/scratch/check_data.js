const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Billing = require('../models/Billing');

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const patients = await User.countDocuments({ role: 'patient' });
    const doctors = await User.countDocuments({ role: 'doctor' });
    const appointments = await Appointment.countDocuments();
    const paidBills = await Billing.find({ status: 'paid' });
    const revenue = paidBills.reduce((acc, bill) => acc + bill.netAmount, 0);
    
    console.log('--- DATABASE STATUS ---');
    console.log('Total Patients:', patients);
    console.log('Total Doctors:', doctors);
    console.log('Total Appointments:', appointments);
    console.log('Total Revenue:', revenue);
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkData();
