module.exports = function(app) {
  const cards = require("../controllers/card.controller.js");
  const { verifyToken } = require("../middlewares/authJwt");

  // Protected routes (require authentication)
  app.post("/api/cards", [verifyToken], cards.createCard);
  app.get("/api/cards/user/:userId", [verifyToken], cards.getUserCards);
  
  // Public routes
  app.get("/api/cards/search", cards.searchCards);
  app.get("/api/cards", cards.getAllCards);
  app.get("/api/cards/:id", cards.findOne);
};
