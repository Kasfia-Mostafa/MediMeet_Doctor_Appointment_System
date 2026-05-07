const express = require('express');
const router = express.Router();
const { getRecords, createRecord, getRecord, updateRecord, deleteRecord } = require('../controllers/recordController');
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { upload } = require('../config/cloudinary');

router.use(protect);
router.get('/', getRecords);
router.post('/', roleAuth('doctor'), upload.array('files', 5), createRecord);
router.get('/:id', getRecord);
router.put('/:id', roleAuth('doctor'), upload.array('files', 5), updateRecord);
router.delete('/:id', roleAuth('doctor'), deleteRecord);

module.exports = router;
