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

router.use(protect);

// POST /api/appointments — uses multer for file upload then creates the appointment
router.post('/', (req, res, next) => {
  console.log('[appointmentRoutes] POST / request received');
  uploadMedicalFiles(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, createAppointment);

router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.put('/:id', updateAppointment);
router.put('/:id/reschedule', rescheduleAppointment);
router.delete('/:id', cancelAppointment);

module.exports = router;
