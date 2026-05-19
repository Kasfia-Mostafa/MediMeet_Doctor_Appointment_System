/**
 * ============================================================
 * Doctor Routes — /api/doctors
 * ============================================================
 * Defines routes for doctor-related operations. Public routes
 * include doctor listings, individual profiles, and slot
 * queries. Private routes (doctor-only) include patient
 * directory and schedule management.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { getDoctors, getDoctor, getSlots, updateSchedule, getMyPatients, getPatientDetail } = require('../controllers/doctorController');
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// ── Private Routes (Doctor only) ───────────────────────────
router.get('/patients', protect, roleAuth('doctor'), getMyPatients);              // GET /api/doctors/patients      — My patient directory
router.get('/patients/:id', protect, roleAuth('doctor'), getPatientDetail);       // GET /api/doctors/patients/:id  — Patient detail view
router.put('/schedule', protect, roleAuth('doctor'), updateSchedule);             // PUT /api/doctors/schedule      — Update schedule

// ── Public Routes ──────────────────────────────────────────
router.get('/', getDoctors);                                          // GET /api/doctors          — List all available doctors
router.get('/:id/slots', getSlots);                                   // GET /api/doctors/:id/slots — Get available time slots
router.get('/:id', getDoctor);                                        // GET /api/doctors/:id      — Get single doctor profile

module.exports = router;
