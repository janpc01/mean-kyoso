const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount, email) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'cad',
      receipt_email: email,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        email: email
      }
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

module.exports = { createPaymentIntent };