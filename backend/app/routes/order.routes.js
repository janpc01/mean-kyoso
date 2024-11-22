const controller = require('../controllers/order.controller');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/orders", controller.createOrder);
  app.get("/api/orders", controller.getUserOrders);
  app.get("/api/orders/:orderId", controller.getOrderById);
  app.put("/api/orders/:orderId/status", controller.updateOrderStatus);
};