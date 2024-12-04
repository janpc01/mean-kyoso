const controller = require('../controllers/order.controller');
const cors = require('cors');

module.exports = function(app) {
  const corsOptions = {
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://kyosocards.com",
        "https://mango-plant-0d19e2110.4.azurestaticapps.net",
        "https://order-processor-ewexgkcvhnhzbqhc.canadacentral-01.azurewebsites.net"
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept', 'Access-Control-Allow-Headers'],
    exposedHeaders: ['Set-Cookie'],
  };

  // Apply CORS specifically for order routes
  app.use('/api/orders', cors(corsOptions));
  
  // Handle OPTIONS preflight requests
  app.options('/api/orders/*', cors(corsOptions));

  // Define routes
  app.post("/api/orders", controller.createOrder);
  app.get("/api/orders", controller.getUserOrders);
  app.get("/api/orders/:orderId", controller.getOrderById);
  app.put("/api/orders/:orderId/status", controller.updateOrderStatus);
};