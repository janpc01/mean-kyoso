const { authJwt } = require('../middlewares');
const controller = require('../controllers/payment.controller');

module.exports = function(app) {
  app.post(
    "/api/payment/create-payment-intent",
    [authJwt.verifyToken],
    controller.createPaymentIntent
  );
};