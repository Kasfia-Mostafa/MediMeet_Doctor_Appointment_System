const express = require('express');
const router = express.Router();
const { getDoctors, getDoctor, getSlots, updateSchedule, getMyPatients, getPatientDetail } = require('../controllers/doctorController');
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.get('/', getDoctors);
router.get('/patients', protect, roleAuth('doctor'), getMyPatients);
router.get('/patients/:id', protect, roleAuth('doctor'), getPatientDetail);
router.get('/:id', getDoctor);
router.get('/:id/slots', getSlots);
router.put('/schedule', protect, roleAuth('doctor'), updateSchedule);

module.exports = router;
