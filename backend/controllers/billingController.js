const Billing = require('../models/Billing');

// @desc    Get bills
// @route   GET /api/billing
const getBills = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'patient') query.patient = req.user._id;
    if (req.query.status) query.status = req.query.status;

    const bills = await Billing.find(query)
      .populate('patient', 'name email')
      .populate({
        path: 'appointment',
        populate: { path: 'doctor', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (error) {
    next(error);
  }
};

// @desc    Create bill
// @route   POST /api/billing
const createBill = async (req, res, next) => {
  try {
    const bill = await Billing.create(req.body);
    res.status(201).json(bill);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark bill as paid
// @route   PUT /api/billing/:id/pay
const payBill = async (req, res, next) => {
  try {
    const bill = await Billing.findById(req.params.id);
    if (!bill) {
      res.status(404);
      throw new Error('Bill not found');
    }

    bill.status = 'paid';
    bill.paymentMethod = req.body.paymentMethod || 'cash';
    bill.paidAt = new Date();
    await bill.save();

    res.json(bill);
  } catch (error) {
    next(error);
  }
};

module.exports = { getBills, createBill, payBill };
