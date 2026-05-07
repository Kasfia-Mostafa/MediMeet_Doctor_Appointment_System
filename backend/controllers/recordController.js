const MedicalRecord = require('../models/MedicalRecord');

// @desc    Get records
// @route   GET /api/records
const getRecords = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'patient') query.patient = req.user._id;
    if (req.query.patient && req.user.role === 'doctor') query.patient = req.query.patient;
    if (req.query.type) query.type = req.query.type;

    const records = await MedicalRecord.find(query)
      .populate('doctor', 'name avatar')
      .populate('patient', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    next(error);
  }
};

// @desc    Create record
// @route   POST /api/records
const createRecord = async (req, res, next) => {
  try {
    const { patient, appointment, type, title, description, diagnosis, medications, vitals } = req.body;

    const files = req.files
      ? req.files.map((f) => ({ url: f.path, publicId: f.filename, name: f.originalname, type: f.mimetype }))
      : [];

    const record = await MedicalRecord.create({
      patient, doctor: req.user._id, appointment, type, title, description, diagnosis,
      medications: medications ? JSON.parse(medications) : [],
      vitals: vitals ? JSON.parse(vitals) : {},
      files,
    });

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single record
// @route   GET /api/records/:id
const getRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('doctor', 'name avatar')
      .populate('patient', 'name avatar')
      .populate('appointment');

    if (!record) {
      res.status(404);
      throw new Error('Record not found');
    }

    res.json(record);
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecords, createRecord, getRecord };
