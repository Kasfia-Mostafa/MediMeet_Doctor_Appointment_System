/**
 * ============================================================
 * Contact Controller — Contact Form Submissions
 * ============================================================
 * Handles public contact form submissions from visitors.
 * ============================================================
 */

const Contact = require('../models/Contact');

/**
 * @desc    Submit a contact form message
 * @route   POST /api/contact
 * @access  Public
 */
const submitContact = async (req, res, next) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({ message: 'Message sent successfully', contact });
  } catch (error) { next(error); }
};

module.exports = { submitContact };
