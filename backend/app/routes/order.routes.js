const controller = require('../controllers/order.controller');
const { authJwt } = require('../middlewares');

module.exports = function (app) {
    // Public Routes
    app.post("/api/orders", controller.createOrder); // Public: Place an order
    app.get("/api/orders/:orderId", controller.getOrderById); // Public: Fetch order details by ID

    // Protected Routes
    app.get("/api/orders", [authJwt.verifyToken], controller.getUserOrders); // Protected: Get orders for a user
    app.put("/api/orders/:orderId/status", [authJwt.verifyToken], controller.updateOrderStatus); // Protected: Update order status
};
