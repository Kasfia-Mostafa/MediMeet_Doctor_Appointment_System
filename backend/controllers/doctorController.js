/**
 * ============================================================
 * Doctor Controller — Public Listings, Slots & Schedule
 * ============================================================
 * Handles doctor-related operations: public doctor listings
 * with search/filter, individual doctor details, available
 * time slot computation, schedule management, and patient
 * directory for doctors.
 * ============================================================
 */

const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

/**
 * @desc    Get all available doctors (public listing with search & filter)
 * @route   GET /api/doctors
 * @access  Public
 *
 * Supports query params: specialization, search, page, limit
 * Search looks across doctor name, hospital, and specialization.
 */
const getDoctors = async (req, res, next) => {
  try {
    const { specialization, search, page = 1, limit = 100 } = req.query;
    let query = { isAvailable: true };

    // 1. Specialization Filter (tab-based strict match)
    if (specialization && specialization !== 'All') {
      query.specialization = specialization;
    }

    // 2. Advanced Search Logic — searches name, hospital, and optionally specialization
    if (search) {
      const searchRegex = new RegExp(search.trim().replace(/\s+/g, '|'), 'i');

      // Find User IDs matching the search term by doctor name
      const matchingUsers = await User.find({
        name: searchRegex,
        role: 'doctor'
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      // Combine search criteria using $or
      const searchCriteria = [
        { user: { $in: userIds } },        // Match by doctor name
        { hospital: searchRegex }           // Match by hospital name
      ];

      // Only add specialization to search if no tab filter is active
      if (!query.specialization) {
        searchCriteria.push({ specialization: searchRegex });
      }

      query.$or = searchCriteria;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population and sorting
    const [doctors, total] = await Promise.all([
      Doctor.find(query)
        .populate('user', 'name email phone avatar gender')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ rating: -1, experience: -1 }),  // Best rated and most experienced first
      Doctor.countDocuments(query)
    ]);

    res.json({
      doctors,
      total,
      pages: Math.ceil(total / limit),
      page: parseInt(page)
    });
  } catch (error) {
    console.error('GET DOCTORS ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Get a single doctor's full profile
 * @route   GET /api/doctors/:id
 * @access  Public
 */
const getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phone avatar gender');
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }
    res.json(doctor);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get available time slots for a doctor on a specific date
 * @route   GET /api/doctors/:id/slots?date=YYYY-MM-DD&patientId=xxx
 * @access  Public
 *
 * Generates 30-minute interval slots from the doctor's configured
 * time windows, then filters out already-booked slots and
 * patient-busy slots to prevent double-booking.
 */
const getSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }

    // Parse date in UTC to avoid timezone shifts
    const [year, month, day] = date.split('-').map(Number);
    const queryDate = new Date(Date.UTC(year, month - 1, day));
    
    // Determine the day of the week for the requested date
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[queryDate.getUTCDay()];
    
    // Get the doctor's time slots configured for this day of the week
    const daySlots = doctor.timeSlots.filter((s) => s.day === dayOfWeek);

    // Find existing booked appointments for this doctor on this date
    const bookedAppointments = await Appointment.find({
      doctor: doctor.user,
      date: queryDate,
      status: { $in: ['pending', 'confirmed'] },
    });
    const bookedSlots = bookedAppointments.map((a) => a.timeSlot);

    // Check if the patient already has appointments at these times (prevent double-booking)
    let patientBusySlots = [];
    if (req.query.patientId) {
      const patientAppointments = await Appointment.find({
        patient: req.query.patientId,
        date: queryDate,
        status: { $in: ['pending', 'confirmed'] },
      });
      patientBusySlots = patientAppointments.map(a => a.timeSlot);
    }

    console.log(`[getSlots Analysis] Date: ${date}, UTC: ${queryDate.toISOString()}, Day: ${dayOfWeek}, DaySlots: ${daySlots.length}, Booked: ${bookedSlots.length}`);

    // Generate all possible 30-minute interval time slots from the doctor's windows
    const allSlots = [];
    daySlots.forEach((slot) => {
      let start = parseInt(slot.startTime.replace(':', ''));
      const end = parseInt(slot.endTime.replace(':', ''));

      // Generate 30-minute intervals within the time window
      while (start < end) {
        const timeStr = `${String(Math.floor(start / 100)).padStart(2, '0')}:${String(start % 100).padStart(2, '0')}`;
        allSlots.push(timeStr);
        start += 30;
        // Handle minute overflow (e.g., 0930 + 30 = 0960 → should be 1000)
        if (start % 100 >= 60) start = (Math.floor(start / 100) + 1) * 100;
      }
    });

    res.json({ 
      slots: allSlots,          // All generated time slots
      bookedSlots,              // Slots already booked for this doctor
      patientBusy: patientBusySlots,  // Slots where the patient is busy
      daySlots                  // Raw time slot configuration
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update doctor's schedule and professional info
 * @route   PUT /api/doctors/schedule
 * @access  Private (Doctor only)
 */
const updateSchedule = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor profile not found');
    }

    const { availableDays, timeSlots, isAvailable, consultationFee, bio, languages, hospital, department, specialization, qualification } = req.body;

    console.log('[updateSchedule Request]', {
      doctorId: doctor._id,
      userId: req.user._id,
      availableDays,
      timeSlots
    });

    // Update only the fields that are provided
    if (availableDays !== undefined) {
      doctor.availableDays = availableDays;
      doctor.markModified('availableDays'); // Required for array fields
    }
    if (timeSlots !== undefined) {
      doctor.timeSlots = timeSlots;
      doctor.markModified('timeSlots');
    }
    if (typeof isAvailable !== 'undefined') doctor.isAvailable = isAvailable;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (bio !== undefined) doctor.bio = bio;
    if (languages !== undefined) doctor.languages = languages;
    if (hospital !== undefined) doctor.hospital = hospital;
    if (department !== undefined) doctor.department = department;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (qualification !== undefined) doctor.qualification = qualification;

    const savedDoctor = await doctor.save();
    console.log('[updateSchedule Success]', {
      doctorId: savedDoctor._id,
      availableDays: savedDoctor.availableDays,
      timeSlots: savedDoctor.timeSlots
    });
    res.json(savedDoctor);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all unique patients who have visited this doctor
 * @route   GET /api/doctors/patients
 * @access  Private (Doctor only)
 *
 * Deduplicates patients from all appointments and returns
 * each patient with their last visit date and total visit count.
 */
const getMyPatients = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name email phone avatar gender dateOfBirth bloodGroup')
      .sort({ date: -1 });

    // Deduplicate patients using a Map (keyed by patient ID)
    const patientMap = new Map();
    appointments.forEach((appt) => {
      if (appt.patient && !patientMap.has(appt.patient._id.toString())) {
        patientMap.set(appt.patient._id.toString(), {
          patient: appt.patient,
          lastVisit: appt.date,
          totalVisits: appointments.filter((a) => a.patient && a.patient._id.toString() === appt.patient._id.toString()).length,
        });
      }
    });

    res.json(Array.from(patientMap.values()));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed patient info and appointment history for a doctor
 * @route   GET /api/doctors/patients/:id
 * @access  Private (Doctor only)
 */
const getPatientDetail = async (req, res, next) => {
  try {
    const patient = await User.findById(req.params.id).select('name email phone avatar gender dateOfBirth bloodGroup address emergencyContact');
    if (!patient) {
      res.status(404);
      throw new Error('Patient not found');
    }

    // Get all appointments between this doctor and this patient
    const appointments = await Appointment.find({
      doctor: req.user._id,
      patient: req.params.id
    }).sort({ date: -1 });

    res.json({ patient, appointments });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDoctors, getDoctor, getSlots, updateSchedule, getMyPatients, getPatientDetail };
