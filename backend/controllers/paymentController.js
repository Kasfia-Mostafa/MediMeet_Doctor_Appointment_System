/**
 * ============================================================
 * Payment Controller — Stripe Payment Processing
 * ============================================================
 * Handles Stripe payment intent creation for appointment
 * consultation fees. The frontend uses the client secret
 * to complete payment via Stripe Elements.
 * ============================================================
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key');
const Doctor = require('../models/Doctor');

/**
 * @desc    Create a Stripe PaymentIntent for a doctor's consultation fee
 * @route   POST /api/payments/create-intent
 * @access  Private
 *
 * Fetches the doctor's consultation fee, converts it to the
 * smallest currency unit (paisa for BDT), and creates a
 * Stripe PaymentIntent. Returns the client secret for the
 * frontend to complete the payment.
 */
const createPaymentIntent = async (req, res, next) => {
  console.log('[paymentController] createPaymentIntent received for doctor:', req.body.doctorId);
  try {
    const { doctorId } = req.body;
    
    // Fetch doctor profile to get the consultation fee
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.log('[paymentController] Doctor not found:', doctorId);
      res.status(404);
      throw new Error('Doctor not found');
    }

    console.log('[paymentController] Doctor found:', doctor.user, 'Fee:', doctor.consultationFee);

    // Amount must be in smallest currency unit (paisa for BDT, cents for USD)
    const amount = doctor.consultationFee * 100;
    console.log('[paymentController] Creating intent for amount:', amount);

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'bdt',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('[paymentController] Intent created:', paymentIntent.id);

    // Return the client secret for the frontend Stripe Elements
    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: doctor.consultationFee
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPaymentIntent };
