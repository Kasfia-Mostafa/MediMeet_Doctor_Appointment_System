const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const checkAllUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const emails = [
      'kasfiasworna@gmail.com',
      'kasfiamostafa03@gmail.com',
      'farzana.skin@example.com'
    ];
    
    console.log('--- USER ROLE AUDIT ---');
    for (const email of emails) {
      const user = await User.findOne({ email });
      if (user) {
        console.log(`${email}: [${user.role}] - Name: ${user.name}`);
      } else {
        console.log(`${email}: NOT FOUND`);
      }
    }
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkAllUsers();
