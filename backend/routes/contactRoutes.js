/**
 * ============================================================
 * Contact Routes — /api/contact
 * ============================================================
 * Defines the public endpoint for contact form submissions.
 * No authentication is required.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contactController');

router.post('/', submitContact); // POST /api/contact — Submit a contact message

module.exports = router;
