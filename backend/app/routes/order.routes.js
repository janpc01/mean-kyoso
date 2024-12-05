const controller = require('../controllers/order.controller');
const { authJwt } = require('../middlewares');

module.exports = function(app) {
  // Apply CORS for all order routes
  app.use('/api/orders', (req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
      return res.sendStatus(204);
    }
    next();
  });

  // Public routes
  app.post("/api/orders", controller.createOrder);
  app.get("/api/orders/:orderId", controller.getOrderById);

  // Protected routes
  app.get("/api/orders", [authJwt.verifyToken], controller.getUserOrders);
  app.put("/api/orders/:orderId/status", [authJwt.verifyToken], controller.updateOrderStatus);
};
