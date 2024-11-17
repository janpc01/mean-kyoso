const { authJwt } = require('../middlewares');
const controller = require('../controllers/order.controller');

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // Create new order
    app.post(
        "/api/orders",
        [authJwt.verifyToken],
        controller.createOrder
    );

    // Get user's orders
    app.get(
        "/api/orders",
        [authJwt.verifyToken],
        controller.getUserOrders
    );

    // Get specific order
    app.get(
        "/api/orders/:orderId",
        [authJwt.verifyToken],
        controller.getOrderById
    );

    // Update order status (could be restricted to admin/moderator)
    app.put(
        "/api/orders/:orderId/status",
        [authJwt.verifyToken, authJwt.isModeratorOrAdmin],
        controller.updateOrderStatus
    );
};