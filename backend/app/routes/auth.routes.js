const controller = require("../controllers/auth.controller");
const verifySignUp = require("../middlewares/verifySignUp");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  });

  app.post("/api/auth/signup", [verifySignUp.checkDuplicateEmail], controller.signup);
  app.post("/api/auth/signin", controller.signin);
  app.post("/api/auth/signout", controller.signout);
  app.get("/api/auth/verify", controller.verify);
};