const Contact = require('../models/Contact');

const submitContact = async (req, res, next) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({ message: 'Message sent successfully', contact });
  } catch (error) { next(error); }
};

module.exports = { submitContact };
