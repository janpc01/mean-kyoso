const controller = require("../controllers/auth.controller");
const verifySignUp = require("../middlewares/verifySignUp");

module.exports = function(app) {
  app.post("/api/auth/signup", [verifySignUp.checkDuplicateEmail], controller.signup);
  app.post("/api/auth/signin", controller.signin);
  app.post("/api/auth/signout", controller.signout);
  app.get("/api/auth/verify", controller.verify);
};
