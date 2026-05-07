const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Get all doctors (public)
// @route   GET /api/doctors
const getDoctors = async (req, res, next) => {
  try {
    const { specialization, search, page = 1, limit = 12 } = req.query;
    let query = { isAvailable: true };

    // 1. Specialization Filter (Base Filter)
    if (specialization && specialization !== 'All') {
      query.specialization = specialization; // Strict match is usually better for tabs
    }

    // 2. Advanced Search Logic
    if (search) {
      const searchRegex = new RegExp(search.trim().replace(/\s+/g, '|'), 'i');

      // Find matching user IDs by name
      const matchingUsers = await User.find({
        name: searchRegex,
        role: 'doctor'
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      // We combine search criteria into an $or array
      const searchCriteria = [
        { user: { $in: userIds } },
        { hospital: searchRegex }
      ];

      // Only add specialization to search if no tab is selected
      if (!query.specialization) {
        searchCriteria.push({ specialization: searchRegex });
      }

      query.$or = searchCriteria;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [doctors, total] = await Promise.all([
      Doctor.find(query)
        .populate('user', 'name email phone avatar gender')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ rating: -1, experience: -1 }),
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

// @desc    Get single doctor
// @route   GET /api/doctors/:id
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

// @desc    Get doctor's available slots
// @route   GET /api/doctors/:id/slots
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
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[queryDate.getUTCDay()];
    
    const daySlots = doctor.timeSlots.filter((s) => s.day === dayOfWeek);

    const bookedAppointments = await Appointment.find({
      doctor: doctor.user,
      date: queryDate,
      status: { $in: ['pending', 'confirmed'] },
    });

    const bookedSlots = bookedAppointments.map((a) => a.timeSlot);

    // Check if the patient is already busy at these times
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

    const allSlots = [];
    daySlots.forEach((slot) => {
      let start = parseInt(slot.startTime.replace(':', ''));
      const end = parseInt(slot.endTime.replace(':', ''));

      while (start < end) {
        const timeStr = `${String(Math.floor(start / 100)).padStart(2, '0')}:${String(start % 100).padStart(2, '0')}`;
        allSlots.push(timeStr);
        start += 30;
        if (start % 100 >= 60) start = (Math.floor(start / 100) + 1) * 100;
      }
    });

    res.json({ 
      slots: allSlots, 
      bookedSlots,
      patientBusy: patientBusySlots, 
      daySlots 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor schedule
// @route   PUT /api/doctors/schedule
const updateSchedule = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor profile not found');
    }

    const { availableDays, timeSlots, isAvailable, consultationFee, bio, languages, hospital, department } = req.body;

    if (availableDays) doctor.availableDays = availableDays;
    if (timeSlots) doctor.timeSlots = timeSlots;
    if (typeof isAvailable !== 'undefined') doctor.isAvailable = isAvailable;
    if (consultationFee) doctor.consultationFee = consultationFee;
    if (bio) doctor.bio = bio;
    if (languages) doctor.languages = languages;
    if (hospital) doctor.hospital = hospital;
    if (department) doctor.department = department;

    await doctor.save();
    res.json(doctor);
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor's patients
// @route   GET /api/doctors/patients
const getMyPatients = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name email phone avatar gender dateOfBirth bloodGroup')
      .sort({ date: -1 });

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

// @desc    Get patient detail for doctor
// @route   GET /api/doctors/patients/:id
const getPatientDetail = async (req, res, next) => {
  try {
    const patient = await User.findById(req.params.id).select('name email phone avatar gender dateOfBirth bloodGroup address emergencyContact');
    if (!patient) {
      res.status(404);
      throw new Error('Patient not found');
    }

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
