const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Doctor = require('../models/Doctor');

const checkSpecs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const specs = await Doctor.distinct('specialization');
    console.log('--- UNIQUE SPECIALIZATIONS IN DB ---');
    console.log(specs);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkSpecs();
