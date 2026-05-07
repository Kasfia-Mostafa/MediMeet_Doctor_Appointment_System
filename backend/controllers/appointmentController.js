const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Billing = require('../models/Billing');
const sendEmail = require('../utils/sendEmail');

// @desc    Book appointment
// @route   POST /api/appointments
const createAppointment = async (req, res, next) => {
  try {
    const { doctor, date, timeSlot, type, reason, symptoms, familyMember, patientNotes, transactionId } = req.body;
    console.log('[createAppointment] Incoming Doctor ID:', doctor);
    console.log('[createAppointment] Incoming Patient ID:', req.user._id);

    if (!date) {
      res.status(400);
      throw new Error('Appointment date is required');
    }

    const [year, month, day] = date.split('-').map(Number);
    const bookingDate = new Date(Date.UTC(year, month - 1, day));

    // 1. Check if the time slot is already booked for this doctor
    const doctorBooked = await Appointment.findOne({
      doctor, date: bookingDate, timeSlot, status: { $in: ['pending', 'confirmed'] },
    });

    if (doctorBooked) {
      console.log(`[createAppointment] Conflict: Doctor already booked for ${date} ${timeSlot}`, doctorBooked._id);
      res.status(400);
      throw new Error(`The doctor is already booked for ${timeSlot} on this date. Please choose another slot.`);
    }

    // 2. Check if the patient already has another appointment at this same time
    const patientBusy = await Appointment.findOne({
      patient: req.user._id, date: bookingDate, timeSlot, status: { $in: ['pending', 'confirmed'] },
    });

    if (patientBusy) {
      console.log(`[createAppointment] Conflict: Patient already busy for ${date} ${timeSlot}`, patientBusy._id);
      res.status(400);
      throw new Error(`You already have another appointment at ${timeSlot} on this date. Please reschedule it first.`);
    }

    console.log('[createAppointment] Conflict checks passed. Processing files...');

    // Process uploaded medical files (if any)
    const medicalFiles = (req.files || []).map((file) => ({
      url: file.path,
      publicId: file.filename,
      originalName: file.originalname,
      fileType: file.mimetype,
    }));

    console.log('[createAppointment] Files processed:', medicalFiles.length);

    // Parse symptoms from comma-separated string if needed
    const parsedSymptoms = Array.isArray(symptoms)
      ? symptoms
      : (symptoms || '').split(',').map((s) => s.trim()).filter(Boolean);

    console.log('[createAppointment] Looking for doctor profile with user ID:', doctor);
    const doctorProfile = await Doctor.findOne({ user: doctor });
    console.log('[createAppointment] Found Doctor Profile:', doctorProfile?._id);

    const appointment = await Appointment.create({
      patient: req.user._id, doctor, doctorProfile: doctorProfile?._id,
      date: bookingDate, timeSlot, type, reason,
      symptoms: parsedSymptoms, familyMember, patientNotes, medicalFiles,
      transactionId: transactionId || '',
      paymentStatus: transactionId ? 'paid' : 'pending',
    });

    const fee = doctorProfile?.consultationFee || 0;
    await Billing.create({
      patient: req.user._id,
      appointment: appointment._id,
      items: [
        {
          description: `Consultation fee on ${date} at ${timeSlot}`,
          amount: fee,
          quantity: 1,
        },
      ],
      totalAmount: fee,
      netAmount: fee,
      status: transactionId ? 'paid' : 'pending',
      paymentMethod: transactionId ? 'card' : '',
      paidAt: transactionId ? new Date() : null,
    });

    const populated = await appointment.populate([
      { path: 'doctor', select: 'name email avatar' },
      { path: 'patient', select: 'name email avatar' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments
// @route   GET /api/appointments
const getAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') query.doctor = req.user._id;

    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name email avatar')
      .populate('patient', 'name email avatar phone')
      .populate('doctorProfile', 'specialization consultationFee')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Appointment.countDocuments(query);
    res.json({ appointments, total, pages: Math.ceil(total / limitNum) });
  } catch (error) {
    console.error('FETCH APPOINTMENTS ERROR:', error);
    next(error);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name email avatar phone')
      .populate('patient', 'name email avatar phone dateOfBirth gender bloodGroup')
      .populate('doctorProfile', 'specialization consultationFee hospital');

    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

// Helper to send cancellation emails
const sendCancellationEmail = async (appointment, userRole) => {
  const populated = await appointment.populate([
    { path: 'doctor', select: 'name' },
    { path: 'patient', select: 'name email' }
  ]);

  if (!populated.patient || !populated.doctor) {
    console.error('Cancellation email failed: Patient or Doctor not found');
    return;
  }

  const cancelledBy = userRole === 'patient' ? 'patient' : (userRole === 'admin' ? 'administrator' : 'doctor');
  const subject = `Appointment Cancelled - Action Required`;
  const message = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #e11d48; border-bottom: 2px solid #e11d48; padding-bottom: 10px;">Cancellation Notice</h2>
      <p>Hello <strong>${populated.patient.name}</strong>,</p>
      <p>Your appointment with <strong>${populated.doctor.name}</strong> on <strong>${new Date(populated.date).toLocaleDateString()} at ${populated.timeSlot}</strong> has been cancelled.</p>

      <div style="background: #fff1f2; padding: 15px; border-radius: 8px; border-left: 4px solid #e11d48; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #9f1239;">Important Information:</h4>
        <ul style="padding-left: 20px; margin: 0;">
          <li>If you wish to <strong>reschedule</strong>, please visit the portal to book a new time.</li>
          <li>Otherwise, your <strong>refund</strong> will be processed and credited within <strong>2 business days</strong>.</li>
        </ul>
      </div>

      <p>Reason for cancellation: <em>${populated.cancelReason || 'Administrative decision'}</em></p>

      <p style="margin-top: 30px; font-size: 13px; color: #666;">This is an automated notification. Please do not reply.</p>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p style="text-align: center; font-weight: bold; color: #0f172a;">MediMeet Healthcare</p>
    </div>
  `;

  try {
    await sendEmail({ email: populated.patient.email, subject, message });
  } catch (err) {
    console.error('Email failed to send:', err.message);
  }
};

// Helper to send confirmation emails
const sendConfirmationEmail = async (appointment, userRole) => {
  const populated = await appointment.populate([
    { path: 'doctor', select: 'name' },
    { path: 'patient', select: 'name email' }
  ]);

  if (!populated.patient || !populated.doctor) {
    console.error('Email failed: Patient or Doctor not found for appointment', appointment._id);
    return;
  }

  const confirmedBy = userRole === 'admin' ? 'administrator' : 'doctor';
  const subject = `Appointment Confirmed - MediMeet Healthcare`;
  const message = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">Appointment Confirmed</h2>
      <p>Hello <strong>${populated.patient.name}</strong>,</p>
      <p>Great news! Your appointment with <strong>Dr. ${populated.doctor.name}</strong> has been confirmed by the ${confirmedBy}.</p>

      <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #166534;">Appointment Details:</h4>
        <ul style="padding: 0; list-style: none;">
          <li><strong>Date:</strong> ${new Date(populated.date).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${populated.timeSlot}</li>
          <li><strong>Type:</strong> ${populated.type || 'General Consultation'}</li>
        </ul>
      </div>

      <p>Please arrive 10 minutes before your scheduled time. If you need to reschedule or have any questions, please contact us through the portal.</p>

      <p style="margin-top: 30px; font-size: 13px; color: #666;">This is an automated notification. Please do not reply.</p>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p style="text-align: center; font-weight: bold; color: #0f172a;">MediMeet Healthcare</p>
    </div>
  `;

  try {
    await sendEmail({ email: populated.patient.email, subject, message });
  } catch (err) {
    console.error('Confirmation email failed to send:', err.message);
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    const { status, notes, prescription, followUp, cancelReason } = req.body;
    const oldStatus = appointment.status;

    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    if (prescription) appointment.prescription = prescription;
    if (followUp) appointment.followUp = followUp;
    if (cancelReason) appointment.cancelReason = cancelReason;

    await appointment.save();

    // If status changed to cancelled, send email
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      await sendCancellationEmail(appointment, req.user.role);
    }

    // If status changed to confirmed, send confirmation email
    if (status === 'confirmed' && oldStatus !== 'confirmed') {
      await sendConfirmationEmail(appointment, req.user.role);
    }

    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
const rescheduleAppointment = async (req, res, next) => {
  try {
    const { date, timeSlot } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    if (!date || !timeSlot) {
      res.status(400);
      throw new Error('Please provide new date and time slot');
    }

    const [year, month, day] = date.split('-').map(Number);
    const bookingDate = new Date(Date.UTC(year, month - 1, day));

    // Conflict check
    const conflict = await Appointment.findOne({
      doctor: appointment.doctor,
      date: bookingDate,
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
      _id: { $ne: appointment._id }
    });

    if (conflict) {
      res.status(400);
      throw new Error('The selected slot is already booked');
    }

    appointment.date = bookingDate;
    appointment.timeSlot = timeSlot;
    appointment.status = 'pending'; // Reset to pending for doctor re-approval

    await appointment.save();

    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    appointment.status = 'cancelled';
    appointment.cancelReason = req.body.reason || 'Cancelled by user';
    await appointment.save();

    await sendCancellationEmail(appointment, req.user.role);

    res.json({ message: 'Appointment cancelled', appointment });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAppointment, getAppointments, getAppointment, updateAppointment, cancelAppointment, rescheduleAppointment };
