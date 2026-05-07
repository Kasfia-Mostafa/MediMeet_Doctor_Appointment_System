import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ clientSecret, onPaymentSuccess, isProcessing, setIsProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[StripeCheckout] handleSubmit started');
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: user?.name || 'Patient',
            email: user?.email || '',
            phone: user?.phone || '',
            address: {
              country: 'BD',
            },
          },
        },
      },
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentSuccess(paymentIntent.id);
    } else {
      console.log('[StripeCheckout] Unexpected status:', paymentIntent?.status);
      setIsProcessing(false);
      if (paymentIntent) toast.error(`Payment ${paymentIntent.status}`);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={{ 
        layout: 'tabs',
        fields: {
          billingDetails: {
            name: 'never',
            email: 'never',
            phone: 'never',
            address: {
              country: 'never'
            }
          }
        },
        wallets: {
          applePay: 'never',
          googlePay: 'never'
        },
        link: 'never'
      }} />
      <button disabled={isProcessing || !stripe || !elements} id="submit" style={{ display: 'none' }}>
        Submit
      </button>
    </form>
  );
};

export default function StripeCheckout({ doctorId, onPaymentSuccess, isProcessing, setIsProcessing }) {
  const [clientSecret, setClientSecret] = useState('');

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

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#532b88',
    },
  };

  return (
    <div className="ba-stripe-container" style={{ marginTop: '24px' }}>
      {clientSecret ? (
        <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
          <CheckoutForm 
            clientSecret={clientSecret} 
            onPaymentSuccess={onPaymentSuccess}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        </Elements>
      ) : (
        <div className="flex justify-center p-4">
          <span className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
        </div>
      )}
    </div>
  );
}
