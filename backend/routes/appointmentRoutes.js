/**
 * ============================================================
 * Appointment Routes — /api/appointments
 * ============================================================
 * Defines routes for appointment CRUD operations. All routes
 * require authentication. The POST route uses multer middleware
 * for medical file uploads before creating the appointment.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  rescheduleAppointment,
} = require('../controllers/appointmentController');
const protect = require('../middleware/auth');
const uploadMedicalFiles = require('../middleware/uploadMedicalFiles');

// All appointment routes require authentication
router.use(protect);

// POST /api/appointments — Book a new appointment (with optional file uploads)
// The multer middleware processes file uploads before the controller runs
router.post('/', (req, res, next) => {
  console.log('[appointmentRoutes] POST / request received');
  uploadMedicalFiles(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, createAppointment);

router.get('/', getAppointments);                   // GET    /api/appointments         — List appointments
router.get('/:id', getAppointment);                 // GET    /api/appointments/:id     — Get single appointment
router.put('/:id', updateAppointment);              // PUT    /api/appointments/:id     — Update appointment
router.put('/:id/reschedule', rescheduleAppointment); // PUT  /api/appointments/:id/reschedule — Reschedule
router.delete('/:id', cancelAppointment);           // DELETE /api/appointments/:id     — Cancel appointment

module.exports = router;
