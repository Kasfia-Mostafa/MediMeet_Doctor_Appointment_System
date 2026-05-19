/**
 * ============================================================
 * Record Controller — Medical Records CRUD
 * ============================================================
 * Handles medical record operations: listing records (filtered
 * by patient/doctor role), creating new records with file
 * uploads, fetching individual records, updating, and deleting.
 * Only the creating doctor (or admin) can modify/delete records.
 * ============================================================
 */

const MedicalRecord = require('../models/MedicalRecord');

/**
 * @desc    Get medical records (patients see own; doctors can filter by patient)
 * @route   GET /api/records
 * @access  Private
 */
const getRecords = async (req, res, next) => {
  try {
    const query = {};

    // Patients only see their own records
    if (req.user.role === 'patient') query.patient = req.user._id;
    // Doctors can filter by patient ID via query param
    if (req.query.patient && req.user.role === 'doctor') query.patient = req.query.patient;
    // Optional type filter (prescription, lab-result, other)
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

/**
 * @desc    Create a new medical record (with optional file uploads)
 * @route   POST /api/records
 * @access  Private (Doctor only)
 */
const createRecord = async (req, res, next) => {
  try {
    const { patient, appointment, type, title, description, medications, vitals } = req.body;

    // Process uploaded files from Cloudinary
    const files = req.files
      ? req.files.map((f) => ({ url: f.path, publicId: f.filename, name: f.originalname, type: f.mimetype }))
      : [];

    const record = await MedicalRecord.create({
      patient, doctor: req.user._id, appointment, type, title, description,
      medications: medications ? JSON.parse(medications) : [],  // Parse JSON string from form data
      vitals: vitals ? JSON.parse(vitals) : {},
      files,
    });

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single medical record by ID
 * @route   GET /api/records/:id
 * @access  Private
 */
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

/**
 * @desc    Update an existing medical record
 * @route   PUT /api/records/:id
 * @access  Private (Creating doctor or Admin only)
 */
const updateRecord = async (req, res, next) => {
  try {
    const { title, type, description } = req.body;
    let record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      res.status(404);
      throw new Error('Record not found');
    }

    // Authorization: only the doctor who created the record or an admin can update
    if (record.doctor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized to update this record');
    }

    // Apply updates
    record.title = title || record.title;
    record.type = type || record.type;
    record.description = description || record.description;

    // Append any new uploaded files to existing files array
    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map((f) => ({ url: f.path, publicId: f.filename, name: f.originalname, type: f.mimetype }));
      record.files = [...record.files, ...newFiles];
    }

    const updatedRecord = await record.save();
    res.json(updatedRecord);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a medical record
 * @route   DELETE /api/records/:id
 * @access  Private (Creating doctor or Admin only)
 */
const deleteRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      res.status(404);
      throw new Error('Record not found');
    }

    // Authorization check
    if (record.doctor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized to delete this record');
    }

    await record.deleteOne();
    res.json({ message: 'Record removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecords, createRecord, getRecord, updateRecord, deleteRecord };
