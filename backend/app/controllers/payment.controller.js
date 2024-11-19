const { createPaymentIntent } = require('../services/stripe.service');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, email, isGuest } = req.body;
    
    // You might want to add additional validation for guest users
    if (isGuest && !email) {
      return res.status(400).json({ error: 'Email is required for guest checkout' });
    }

    const paymentIntent = await createPaymentIntent(amount, email);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
};