const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, getFamily, addFamily, removeFamily } = require('../controllers/userController');
const protect = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', upload.single('avatar'), updateProfile);
router.put('/password', changePassword);
router.get('/family', getFamily);
router.post('/family', addFamily);
router.delete('/family/:id', removeFamily);

module.exports = router;
