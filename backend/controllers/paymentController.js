const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key');
const Doctor = require('../models/Doctor');

// @desc    Create Stripe payment intent
// @route   POST /api/payments/create-intent
const createPaymentIntent = async (req, res, next) => {
  console.log('[paymentController] createPaymentIntent received for doctor:', req.body.doctorId);
  try {
    const { doctorId } = req.body;
    
    // Fetch doctor to get consultation fee
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.log('[paymentController] Doctor not found:', doctorId);
      res.status(404);
      throw new Error('Doctor not found');
    }

    console.log('[paymentController] Doctor found:', doctor.user, 'Fee:', doctor.consultationFee);

    // Amount must be in smallest currency unit (paisa for BDT, cents for USD)
    // Assuming consultationFee is in BDT
    const amount = doctor.consultationFee * 100;
    console.log('[paymentController] Creating intent for amount:', amount);

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'bdt', // or 'usd' depending on Stripe account region support
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('[paymentController] Intent created:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: doctor.consultationFee
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPaymentIntent };
