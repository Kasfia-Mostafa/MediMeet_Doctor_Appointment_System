const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
require('dotenv').config();

const doctorsData = [
  { name: 'Dr. Md. Abdur Rahman', email: 'rahman.cardio@example.com', phone: '01711122233', specialization: 'Cardiology', qualification: 'MBBS, MD (Cardiology)', experience: 15, consultationFee: 1000, hospital: 'Dhaka Medical College Hospital', location: 'Dhaka' },
  { name: 'Dr. Sharmin Akter', email: 'sharmin.gynae@example.com', phone: '01811222333', specialization: 'Gynecology', qualification: 'MBBS, FCPS', experience: 10, consultationFee: 800, hospital: 'Square Hospital', location: 'Dhaka' },
  { name: 'Dr. Anisul Haque', email: 'anisul.ortho@example.com', phone: '01911333444', specialization: 'Orthopedics', qualification: 'MBBS, MS (Ortho)', experience: 12, consultationFee: 700, hospital: 'Evercare Hospital', location: 'Dhaka' },
  { name: 'Dr. Farhana Yasmin', email: 'farhana.pedia@example.com', phone: '01511444555', specialization: 'Pediatrics', qualification: 'MBBS, DCH', experience: 8, consultationFee: 600, hospital: 'Labaid Specialized Hospital', location: 'Dhaka' },
  { name: 'Dr. Kamal Hossain', email: 'kamal.neuro@example.com', phone: '01311555666', specialization: 'Neurology', qualification: 'MBBS, MD (Neurology)', experience: 20, consultationFee: 1200, hospital: 'United Hospital', location: 'Dhaka' },
  { name: 'Dr. Nusrat Jahan', email: 'nusrat.derma@example.com', phone: '01411666777', specialization: 'Dermatology', qualification: 'MBBS, DDV', experience: 7, consultationFee: 500, hospital: 'Popular Diagnostic Center', location: 'Dhaka' },
  { name: 'Dr. Arifur Rahman', email: 'arif.ent@example.com', phone: '01722777888', specialization: 'ENT', qualification: 'MBBS, DLO', experience: 9, consultationFee: 600, hospital: 'Birdem General Hospital', location: 'Dhaka' },
  { name: 'Dr. Sabrina Khan', email: 'sabrina.eye@example.com', phone: '01822888999', specialization: 'Ophthalmology', qualification: 'MBBS, DO', experience: 11, consultationFee: 700, hospital: 'National Institute of Ophthalmology', location: 'Dhaka' },
  { name: 'Dr. Monirul Islam', email: 'monir.medicine@example.com', phone: '01922999000', specialization: 'Internal Medicine', qualification: 'MBBS, FCPS (Medicine)', experience: 14, consultationFee: 800, hospital: 'Sir Salimullah Medical College', location: 'Dhaka' },
  { name: 'Dr. Tasnim Ara', email: 'tasnim.psych@example.com', phone: '01522000111', specialization: 'Psychiatry', qualification: 'MBBS, MD (Psychiatry)', experience: 6, consultationFee: 1000, hospital: 'National Institute of Mental Health', location: 'Dhaka' },
  { name: 'Dr. Rakibul Hasan', email: 'rakib.urology@example.com', phone: '01322111222', specialization: 'Urology', qualification: 'MBBS, MS (Urology)', experience: 13, consultationFee: 900, hospital: 'Bangabandhu Sheikh Mujib Medical University', location: 'Dhaka' },
  { name: 'Dr. Sadia Afrin', email: 'sadia.dent@example.com', phone: '01422222333', specialization: 'Dentistry', qualification: 'BDS, FCPS', experience: 5, consultationFee: 400, hospital: 'Dhaka Dental College', location: 'Dhaka' },
  { name: 'Dr. Tanvir Ahmed', email: 'tanvir.sur@example.com', phone: '01733333444', specialization: 'General Surgery', qualification: 'MBBS, FCPS (Surgery)', experience: 16, consultationFee: 1000, hospital: 'Chittagong Medical College Hospital', location: 'Chittagong' },
  { name: 'Dr. Lima Begum', email: 'lima.obs@example.com', phone: '01833444555', specialization: 'Obstetrics', qualification: 'MBBS, MS (OBGYN)', experience: 9, consultationFee: 800, hospital: 'Imperial Hospital', location: 'Chittagong' },
  { name: 'Dr. Faisal Karim', email: 'faisal.gast@example.com', phone: '01933555666', specialization: 'Gastroenterology', qualification: 'MBBS, MD (Gastro)', experience: 11, consultationFee: 900, hospital: 'Mount Elizabeth Hospital (Agent Office)', location: 'Chittagong' },
  { name: 'Dr. Rina Parvin', email: 'rina.endo@example.com', phone: '01533666777', specialization: 'Endocrinology', qualification: 'MBBS, MD (Endo)', experience: 8, consultationFee: 800, hospital: 'Birdem-2', location: 'Dhaka' },
  { name: 'Dr. Sazzad Hossain', email: 'sazzad.nephro@example.com', phone: '01333777888', specialization: 'Nephrology', qualification: 'MBBS, MD (Nephrology)', experience: 12, consultationFee: 900, hospital: 'National Institute of Kidney Diseases', location: 'Dhaka' },
  { name: 'Dr. Jesmin Sultana', email: 'jesmin.onco@example.com', phone: '01433888999', specialization: 'Oncology', qualification: 'MBBS, MD (Oncology)', experience: 10, consultationFee: 1100, hospital: 'National Institute of Cancer Research', location: 'Dhaka' },
  { name: 'Dr. Ashraful Islam', email: 'ashraf.pulmo@example.com', phone: '01744999000', specialization: 'Pulmonology', qualification: 'MBBS, MD (Chest)', experience: 14, consultationFee: 800, hospital: 'National Institute of Diseases of the Chest', location: 'Dhaka' },
  { name: 'Dr. Munira Khanam', email: 'munira.radio@example.com', phone: '01844000111', specialization: 'Radiology', qualification: 'MBBS, MD (Radiology)', experience: 7, consultationFee: 600, hospital: 'Ibn Sina Medical College', location: 'Dhaka' },
  { name: 'Dr. Zahidul Haque', email: 'zahid.hepa@example.com', phone: '01944111222', specialization: 'Hepatology', qualification: 'MBBS, MD (Hepatology)', experience: 13, consultationFee: 1000, hospital: 'Sheikh Russel Gastroliver Institute', location: 'Dhaka' },
  { name: 'Dr. Rubaiya Sharmin', email: 'rubaiya.rhuma@example.com', phone: '01544222333', specialization: 'Rheumatology', qualification: 'MBBS, MD (Rheuma)', experience: 6, consultationFee: 900, hospital: 'BSMMU', location: 'Dhaka' },
  { name: 'Dr. Mamunur Rashid', email: 'mamun.uro@example.com', phone: '01344333444', specialization: 'Urology', qualification: 'MBBS, MS (Urology)', experience: 18, consultationFee: 1100, hospital: 'Holy Family Red Crescent Hospital', location: 'Dhaka' },
  { name: 'Dr. Shamima Nasrin', email: 'shamima.pedia@example.com', phone: '01444444555', specialization: 'Pediatric Surgery', qualification: 'MBBS, MS (Ped. Surgery)', experience: 9, consultationFee: 800, hospital: 'Shishu Hospital', location: 'Dhaka' },
  { name: 'Dr. Tariqul Islam', email: 'tariq.vascular@example.com', phone: '01755555666', specialization: 'Vascular Surgery', qualification: 'MBBS, MS (Vascular)', experience: 11, consultationFee: 1200, hospital: 'NICVD', location: 'Dhaka' },
  { name: 'Dr. Kaniz Fatima', email: 'kaniz.fert@example.com', phone: '01855666777', specialization: 'Fertility Specialist', qualification: 'MBBS, FCPS, Training (Infertility)', experience: 12, consultationFee: 1500, hospital: 'Harvest Fertility Center', location: 'Dhaka' },
  { name: 'Dr. Saiful Alam', email: 'saiful.ortho@example.com', phone: '01955777888', specialization: 'Orthopedics', qualification: 'MBBS, D-Ortho', experience: 10, consultationFee: 700, hospital: 'NITOR (Pangu Hospital)', location: 'Dhaka' },
  { name: 'Dr. Bilkis Jahan', email: 'bilkis.gynae@example.com', phone: '01555888999', specialization: 'Gynecology', qualification: 'MBBS, DGO', experience: 8, consultationFee: 600, hospital: 'Azimpur Maternity Hospital', location: 'Dhaka' },
  { name: 'Dr. Mezbah Uddin', email: 'mezbah.medicine@example.com', phone: '01355999000', specialization: 'Internal Medicine', qualification: 'MBBS, MD (Internal Medicine)', experience: 15, consultationFee: 800, hospital: 'Rajshahi Medical College Hospital', location: 'Rajshahi' },
  { name: 'Dr. Farzana Choudhury', email: 'farzana.skin@example.com', phone: '01455000111', specialization: 'Dermatology', qualification: 'MBBS, Diploma (Dermatology)', experience: 5, consultationFee: 500, hospital: 'Sylhet MAG Osmani Medical College', location: 'Sylhet' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    for (const d of doctorsData) {
      const existingUser = await User.findOne({ email: d.email });
      if (existingUser) {
        console.log(`User ${d.email} already exists, skipping.`);
        continue;
      }

      const user = await User.create({
        name: d.name,
        email: d.email,
        password: 'password123', // Default password
        phone: d.phone,
        role: 'doctor',
      });

      await Doctor.create({
        user: user._id,
        specialization: d.specialization,
        qualification: d.qualification,
        experience: d.experience,
        consultationFee: d.consultationFee,
        hospital: d.hospital,
        location: d.location,
        isAvailable: true,
      });

      console.log(`Seeded doctor: ${d.name}`);
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
