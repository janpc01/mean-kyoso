const { createPaymentIntent } = require('../services/stripe.service');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required for checkout' });
    }

    const paymentIntent = await createPaymentIntent(amount, email);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
};