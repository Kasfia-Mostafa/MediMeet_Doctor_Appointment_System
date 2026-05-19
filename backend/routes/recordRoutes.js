/**
 * ============================================================
 * Record Routes — /api/records
 * ============================================================
 * Defines routes for medical record CRUD operations.
 * All routes require authentication. Creating, updating,
 * and deleting records is restricted to doctors only.
 * File uploads (up to 5 files) use Cloudinary via multer.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { getRecords, createRecord, getRecord, updateRecord, deleteRecord } = require('../controllers/recordController');
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { upload } = require('../config/cloudinary');

// All record routes require authentication
router.use(protect);

router.get('/', getRecords);                                                  // GET    /api/records      — List records
router.post('/', roleAuth('doctor'), upload.array('files', 5), createRecord); // POST   /api/records      — Create record (doctor)
router.get('/:id', getRecord);                                                // GET    /api/records/:id  — Get single record
router.put('/:id', roleAuth('doctor'), upload.array('files', 5), updateRecord); // PUT  /api/records/:id  — Update record (doctor)
router.delete('/:id', roleAuth('doctor'), deleteRecord);                      // DELETE /api/records/:id  — Delete record (doctor)

module.exports = router;
