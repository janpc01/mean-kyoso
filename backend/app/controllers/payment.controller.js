const { createPaymentIntent } = require('../services/stripe.service');

exports.createPaymentIntent = async (req, res) => {
  try {
    console.log('Received payment intent request:', req.body);
    const { amount } = req.body;
    const paymentIntent = await createPaymentIntent(amount);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
};