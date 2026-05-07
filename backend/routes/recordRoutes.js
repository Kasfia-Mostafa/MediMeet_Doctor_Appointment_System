const express = require('express');
const router = express.Router();
const { getRecords, createRecord, getRecord } = require('../controllers/recordController');
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { upload } = require('../config/cloudinary');

router.use(protect);
router.get('/', getRecords);
router.post('/', roleAuth('doctor'), upload.array('files', 5), createRecord);
router.get('/:id', getRecord);

module.exports = router;
