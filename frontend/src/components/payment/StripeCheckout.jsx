/**
 * ============================================================
 * StripeCheckout Component — Stripe Payment Integration
 * ============================================================
 * Provides a two-part Stripe payment integration:
 *
 * 1. StripeCheckout (parent):
 *    - Fetches a PaymentIntent client secret from the backend
 *    - Initializes Stripe Elements with the client secret
 *    - Renders a loading spinner until the client secret is ready
 *
 * 2. CheckoutForm (child):
 *    - Renders the Stripe PaymentElement for card input
 *    - Handles payment confirmation with billing details
 *    - Reports success/failure via callbacks
 *
 * Props:
 *  - doctorId:          ID of the doctor (to determine fee)
 *  - onPaymentSuccess:  Callback with the paymentIntent ID on success
 *  - isProcessing:      Boolean flag for loading state
 *  - setIsProcessing:   Setter for the processing state
 * ============================================================
 */

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';

// Initialize the Stripe SDK with the publishable key from environment
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

/**
 * CheckoutForm — Inner form component rendered inside Stripe Elements.
 * Handles the actual payment submission and confirmation flow.
 */
const CheckoutForm = ({ onPaymentSuccess, isProcessing, setIsProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();

  /**
   * Handles form submission by confirming the payment with Stripe.
   * Uses 'if_required' redirect to avoid full-page redirects for
   * card payments (only redirects for bank-based methods).
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[StripeCheckout] handleSubmit started');
    if (!stripe || !elements) return;

    setIsProcessing(true);

    // Confirm the payment using the PaymentElement data
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: user?.name || 'Patient',
            email: user?.email || '',
            phone: user?.phone || '',
            address: {
              country: 'BD', // Bangladesh
            },
          },
        },
      },
      redirect: 'if_required', // Only redirect for bank transfers, not cards
    });

    if (error) {
      // Payment failed — show error message
      toast.error(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment successful — notify parent component
      onPaymentSuccess(paymentIntent.id);
    } else {
      // Unexpected status (e.g., requires_action)
      console.log('[StripeCheckout] Unexpected status:', paymentIntent?.status);
      setIsProcessing(false);
      if (paymentIntent) toast.error(`Payment ${paymentIntent.status}`);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      {/* Stripe PaymentElement — renders the card input UI */}
      <PaymentElement id="payment-element" options={{
        layout: 'tabs',
        fields: {
          billingDetails: {
            name: 'never',        // Pre-filled from user profile
            email: 'never',
            phone: 'never',
            address: { country: 'never' }
          }
        },
        wallets: {
          applePay: 'never',      // Disable wallet payments
          googlePay: 'never'
        },
        link: 'never'            // Disable Stripe Link
      }} />
      {/* Hidden submit button — triggered programmatically from parent */}
      <button disabled={isProcessing || !stripe || !elements} id="submit" style={{ display: 'none' }}>
        Submit
      </button>
    </form>
  );
};

/**
 * StripeCheckout — Main wrapper component.
 * Fetches the PaymentIntent and renders the Stripe Elements provider.
 */
export default function StripeCheckout({ doctorId, onPaymentSuccess, isProcessing, setIsProcessing }) {
  const [clientSecret, setClientSecret] = useState('');

  // Fetch the PaymentIntent client secret from the backend on mount
  useEffect(() => {
    if (!doctorId) return;
    console.log('[StripeCheckout] Fetching clientSecret for doctor:', doctorId);
    API.post('/payments/create-intent', { doctorId })
      .then((res) => {
        console.log('[StripeCheckout] clientSecret received');
        setClientSecret(res.data.clientSecret);
      })
      .catch((err) => {
        console.error('[StripeCheckout] create-intent error:', err);
        toast.error('Failed to initialize payment');
      });
  }, [doctorId]);

  // Stripe Elements appearance theme configuration
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#532b88', // MediMeet brand color
    },
  };

  return (
    <div className="ba-stripe-container" style={{ marginTop: '24px' }}>
      {clientSecret ? (
        // Render Stripe Elements once the client secret is available
        <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
          <CheckoutForm
            clientSecret={clientSecret}
            onPaymentSuccess={onPaymentSuccess}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        </Elements>
      ) : (
        // Loading spinner while fetching the client secret
        <div className="flex justify-center p-4">
          <span className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
        </div>
      )}
    </div>
  );
}
